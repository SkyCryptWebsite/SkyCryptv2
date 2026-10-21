import { and, asc, desc, eq, gt, inArray, isNull, ne, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "#lib/server/db";
import { account, adminAuditLog, apikey, minecraftAccount, session, user } from "#lib/server/db/schema";
import { roleRank } from "#lib/shared/roles";

const minecraftUuid = z
  .string()
  .regex(/^(?:[a-fA-F0-9]{32}|[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/)
  .transform((uuid) => uuid.replaceAll("-", "").toLowerCase());
const mcIdProfileSchema = z.object({
  sub: z.string().min(1),
  name: z.string().optional(),
  email: z.string().optional(),
  email_verified: z.boolean().optional(),
  accounts: z
    .array(
      z.object({
        uuid: minecraftUuid,
        username: z
          .string()
          .min(1)
          .max(16)
          .regex(/^[a-zA-Z0-9_]+$/),
        primary: z.boolean()
      })
    )
    .refine(
      (accounts) =>
        new Set(accounts.map((account) => account.uuid)).size === accounts.length &&
        accounts.filter((account) => account.primary).length <= 1
    )
});

export function parseMcIdProfile(profile: unknown) {
  const result = mcIdProfileSchema.safeParse(profile);
  return result.success ? result.data : null;
}

export type McIdProfile = NonNullable<ReturnType<typeof parseMcIdProfile>>;
export type McIdLink = Pick<typeof account.$inferSelect, "id" | "accountId" | "userId" | "providerId">;

export async function getMcIdLinks(userId: string) {
  return db
    .select({ id: account.id, accountId: account.accountId, userId: account.userId, providerId: account.providerId })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "mc-id")));
}

export async function getStoredMinecraftAccounts(userId: string) {
  return db
    .select({
      uuid: minecraftAccount.uuid,
      username: minecraftAccount.username,
      primary: minecraftAccount.primary,
      syncedAt: minecraftAccount.syncedAt,
      accountId: minecraftAccount.accountId
    })
    .from(minecraftAccount)
    .innerJoin(account, eq(minecraftAccount.accountId, account.id))
    .where(and(eq(account.userId, userId), eq(account.providerId, "mc-id")))
    .orderBy(desc(minecraftAccount.primary), asc(minecraftAccount.username));
}

export async function storeMinecraftAccounts(link: McIdLink, profile: McIdProfile) {
  if (link.providerId !== "mc-id" || profile.sub !== link.accountId)
    throw new Error("MC-ID identity does not match the linked account.");
  await db.transaction(async (tx) => {
    // Serialize snapshots and ensure the link still belongs to this user before replacing it.
    const [owner] = await tx
      .select({ id: account.id })
      .from(account)
      .where(
        and(
          eq(account.id, link.id),
          eq(account.userId, link.userId),
          eq(account.providerId, "mc-id"),
          eq(account.accountId, profile.sub)
        )
      )
      .for("update");
    if (!owner) throw new Error("MC-ID account is no longer linked.");
    await tx.delete(minecraftAccount).where(eq(minecraftAccount.accountId, link.id));
    if (profile.accounts.length) {
      const syncedAt = new Date();
      await tx
        .insert(minecraftAccount)
        .values(profile.accounts.map((minecraft) => ({ ...minecraft, accountId: link.id, syncedAt })));
    }
  });
  return banIfEvading(
    link.userId,
    profile.accounts.map((minecraft) => minecraft.uuid)
  );
}

export const BAN_EVASION_REASON = "Ban evasion: this account linked a Minecraft account from a banned account.";

/**
 * Bans a user who links a Minecraft account that also belongs to a currently banned user, for as long as that ban
 * lasts. Returns whether the user was banned.
 */
export async function banIfEvading(userId: string, uuids: string[]) {
  if (!uuids.length) return false;
  const [[target], [source]] = await Promise.all([
    db.select({ role: user.role, banned: user.banned }).from(user).where(eq(user.id, userId)),
    db
      .select({ id: user.id, banExpires: user.banExpires, uuid: minecraftAccount.uuid })
      .from(minecraftAccount)
      .innerJoin(account, eq(account.id, minecraftAccount.accountId))
      .innerJoin(user, eq(user.id, account.userId))
      .where(
        and(
          inArray(minecraftAccount.uuid, uuids),
          ne(user.id, userId),
          eq(user.banned, true),
          or(isNull(user.banExpires), gt(user.banExpires, new Date()))
        )
      )
      // Postgres sorts nulls first when descending, so a permanent ban wins over the longest temporary one.
      .orderBy(desc(user.banExpires))
      .limit(1)
  ]);
  // Staff are never banned automatically, so a mistake can't lock them out.
  if (!target || target.banned || roleRank(target.role) > 0 || !source) return false;
  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({ banned: true, banReason: BAN_EVASION_REASON, banExpires: source.banExpires })
      .where(eq(user.id, userId));
    await tx.delete(session).where(eq(session.userId, userId));
    await tx
      .update(apikey)
      .set({ enabled: false })
      .where(and(eq(apikey.referenceId, userId), eq(apikey.enabled, true)));
    await tx.insert(adminAuditLog).values({
      id: crypto.randomUUID(),
      actorId: null,
      action: "user.ban_evasion",
      targetUserId: userId,
      note: BAN_EVASION_REASON,
      details: { bannedUserId: source.id, uuid: source.uuid }
    });
  });
  return true;
}

export async function fetchMcIdProfile(accessToken: string) {
  const response = await fetch("https://mc-id.com/api/auth/oauth2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
    redirect: "error"
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error("MC-ID could not return your Minecraft accounts.");
  const profile = parseMcIdProfile(await response.json());
  if (!profile)
    throw new Error("MC-ID returned incomplete Minecraft account data. Reconnect MC-ID to grant profile access.");
  return profile;
}
