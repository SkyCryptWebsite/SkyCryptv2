import { command, form, query } from "$app/server";
import { invalid } from "@sveltejs/kit";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { audit, requireOutranks, requireStaff } from "#lib/server/admin";
import { auth } from "#lib/server/auth";
import { db } from "#lib/server/db";
import {
  account,
  adminAuditLog,
  apikey,
  apiKeyRequest,
  rateLimitRequest,
  user as userTable
} from "#lib/server/db/schema";
import { getStoredMinecraftAccounts } from "#lib/server/minecraft-accounts";
import { getStoredPatreonMembership } from "#lib/server/patreon";
import { BAN_DURATIONS, listArgs, USER_FILTERS } from "#lib/shared/admin";
import { can, primaryRole, roleRank, STAFF_ROLES, UserRole } from "#lib/shared/roles";

const discordId = (email: string) => email.split("@")[0];

function filterQuery(filter: (typeof USER_FILTERS)[number]) {
  if (filter === "all") return {};
  if (filter === "banned") return { filterField: "banned", filterValue: true, filterOperator: "eq" as const };
  if (filter === "staff") return { filterField: "role", filterValue: [...STAFF_ROLES], filterOperator: "in" as const };
  return { filterField: "role", filterValue: filter, filterOperator: "eq" as const };
}

export const listUsers = query(
  listArgs.extend({
    filter: z.enum(USER_FILTERS).default("all"),
    sort: z.enum(["createdAt", "name"]).default("createdAt"),
    dir: z.enum(["asc", "desc"]).default("desc")
  }),
  async ({ page, size, q, filter, sort, dir }) => {
    const { headers } = await requireStaff({ user: ["list"] });
    // Discord sign-ins store `<discord id>@discord.placeholder.invalid` as the email.
    const byDiscordId = /^\d{5,}$/.test(q);
    const result = await auth.api.listUsers({
      headers,
      query: {
        limit: size,
        offset: (page - 1) * size,
        sortBy: sort,
        sortDirection: dir,
        ...(q && {
          searchValue: byDiscordId ? `${q}@` : q,
          searchField: byDiscordId ? "email" : "name",
          searchOperator: byDiscordId ? "starts_with" : "contains"
        }),
        ...filterQuery(filter)
      }
    });
    return {
      total: result.total,
      rows: result.users.map((user) => ({
        id: user.id,
        name: user.name,
        image: user.image ?? null,
        discordId: discordId(user.email),
        role: primaryRole(user.role),
        banned: !!user.banned,
        banExpires: user.banExpires ?? null,
        createdAt: user.createdAt
      }))
    };
  }
);

export const getUserDetail = query(z.string().min(1), async (id) => {
  const { staff, headers } = await requireStaff({ user: ["get"] });
  const target = await auth.api.getUser({ query: { id }, headers });
  const [[settings], accounts, minecraft, membership, sessions, requests, rateLimits, history] = await Promise.all([
    // Better Auth's `getUser` result doesn't include additional fields.
    db.select({ developerMode: userTable.developerMode }).from(userTable).where(eq(userTable.id, id)),
    db
      .select({ providerId: account.providerId, accountId: account.accountId, createdAt: account.createdAt })
      .from(account)
      .where(eq(account.userId, id)),
    getStoredMinecraftAccounts(id),
    getStoredPatreonMembership(id),
    auth.api.listUserSessions({ headers, body: { userId: id } }),
    db
      .select({
        id: apiKeyRequest.id,
        name: apiKeyRequest.name,
        status: apiKeyRequest.status,
        createdAt: apiKeyRequest.createdAt,
        keyId: apikey.id,
        keyStart: apikey.start,
        keyEnabled: apikey.enabled
      })
      .from(apiKeyRequest)
      .leftJoin(apikey, eq(apikey.id, apiKeyRequest.apiKeyId))
      .where(eq(apiKeyRequest.userId, id))
      .orderBy(desc(apiKeyRequest.createdAt)),
    db
      .select({
        id: rateLimitRequest.id,
        requestedMax: rateLimitRequest.requestedMax,
        status: rateLimitRequest.status,
        createdAt: rateLimitRequest.createdAt
      })
      .from(rateLimitRequest)
      .where(eq(rateLimitRequest.userId, id))
      .orderBy(desc(rateLimitRequest.createdAt)),
    can(staff.role, { auditLog: ["list"] })
      ? db
          .select({
            id: adminAuditLog.id,
            action: adminAuditLog.action,
            note: adminAuditLog.note,
            createdAt: adminAuditLog.createdAt
          })
          .from(adminAuditLog)
          .where(eq(adminAuditLog.targetUserId, id))
          .orderBy(desc(adminAuditLog.createdAt))
          .limit(20)
      : Promise.resolve(null)
  ]);
  return {
    user: {
      id: target.id,
      name: target.name,
      image: target.image ?? null,
      discordId: discordId(target.email),
      role: primaryRole(target.role),
      banned: !!target.banned,
      banReason: target.banReason ?? null,
      banExpires: target.banExpires ?? null,
      developerMode: !!settings?.developerMode,
      createdAt: target.createdAt
    },
    outranked: target.id !== staff.id && roleRank(target.role) < roleRank(staff.role),
    accounts,
    minecraft,
    membership,
    sessions: sessions.sessions.map(({ id, userAgent, createdAt, expiresAt, impersonatedBy }) => ({
      id,
      userAgent,
      createdAt,
      expiresAt,
      impersonated: !!impersonatedBy
    })),
    requests,
    rateLimits,
    history
  };
});

export const banUser = form(
  z.object({
    userId: z.string().min(1),
    reason: z.string().trim().min(3, "Give a reason (at least 3 characters).").max(500),
    duration: z.enum(Object.keys(BAN_DURATIONS) as [keyof typeof BAN_DURATIONS], "Choose a ban duration.")
  }),
  async ({ userId, reason, duration }) => {
    const { staff, headers } = await requireStaff({ user: ["ban"] });
    await requireOutranks(staff, userId);
    // Better Auth also revokes every session of the banned user.
    await auth.api.banUser({
      headers,
      body: { userId, banReason: reason, banExpiresIn: BAN_DURATIONS[duration].seconds ?? undefined }
    });
    await db.transaction(async (tx) => {
      // Disabled keys count as revoked access, so after an unban the user requests API access again.
      const disabled = await tx
        .update(apikey)
        .set({ enabled: false })
        .where(and(eq(apikey.referenceId, userId), eq(apikey.enabled, true)))
        .returning({ id: apikey.id });
      await audit(tx, {
        actorId: staff.id,
        action: "user.ban",
        targetUserId: userId,
        note: reason,
        details: { duration, disabledKeys: disabled.length }
      });
    });
    await getUserDetail(userId).refresh();
  }
);

export const unbanUser = command(z.string().min(1), async (userId) => {
  const { staff, headers } = await requireStaff({ user: ["ban"] });
  await requireOutranks(staff, userId);
  await auth.api.unbanUser({ headers, body: { userId } });
  await audit(db, { actorId: staff.id, action: "user.unban", targetUserId: userId });
  await getUserDetail(userId).refresh();
});

export const revokeUserSessions = command(z.string().min(1), async (userId) => {
  const { staff, headers } = await requireStaff({ session: ["revoke"] });
  await requireOutranks(staff, userId);
  await auth.api.revokeUserSessions({ headers, body: { userId } });
  await audit(db, { actorId: staff.id, action: "user.revoke_sessions", targetUserId: userId });
  await getUserDetail(userId).refresh();
});

export const setUserRole = form(
  z.object({
    userId: z.string().min(1),
    role: z.enum(Object.values(UserRole), "Choose a role.")
  }),
  async ({ userId, role }, issue) => {
    const { staff, headers } = await requireStaff({ user: ["set-role"] });
    const target = await requireOutranks(staff, userId);
    // Nobody can hand out a rank equal to their own, so new admins are added directly in the database.
    if (roleRank(role) >= roleRank(staff.role)) invalid(issue.role("You can only assign roles below your own."));
    await auth.api.setRole({ headers, body: { userId, role } });
    await audit(db, {
      actorId: staff.id,
      action: "user.set_role",
      targetUserId: userId,
      details: { from: primaryRole(target.role), to: role }
    });
    await getUserDetail(userId).refresh();
  }
);

export const setDeveloperMode = command(
  z.object({ userId: z.string().min(1), enabled: z.boolean() }),
  async ({ userId, enabled }) => {
    const { staff, headers } = await requireStaff({ user: ["update"] });
    await requireOutranks(staff, userId);
    await auth.api.adminUpdateUser({ headers, body: { userId, data: { developerMode: enabled } } });
    await audit(db, {
      actorId: staff.id,
      action: "user.update",
      targetUserId: userId,
      details: { developerMode: enabled }
    });
    await getUserDetail(userId).refresh();
  }
);
