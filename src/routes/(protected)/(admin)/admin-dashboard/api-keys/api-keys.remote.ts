import { command, form, query, requested } from "$app/server";
import { error, invalid } from "@sveltejs/kit";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { z } from "zod";
import { audit, requireOutranks, requireStaff } from "#lib/server/admin";
import { auth } from "#lib/server/auth";
import { db } from "#lib/server/db";
import { adminAuditLog, apikey, apiKeyRequest, rateLimitRequest, user } from "#lib/server/db/schema";
import { listArgs, reviewNote } from "#lib/shared/admin";
import { API_KEY_SCOPES, type ApiKeyScope } from "#lib/shared/constants/developer";
import { can, roleRank } from "#lib/shared/roles";
import { getOverview } from "../admin.remote";

export const listApiKeys = query(
  listArgs.extend({ state: z.enum(["all", "enabled", "disabled"]).default("all") }),
  async ({ page, size, q, state }) => {
    await requireStaff({ user: ["list"] });
    const filters: (SQL | undefined)[] = [
      state === "all" ? undefined : eq(apikey.enabled, state === "enabled"),
      q ? or(ilike(user.name, `%${q}%`), ilike(apikey.start, `%${q}%`), ilike(apiKeyRequest.name, `%${q}%`)) : undefined
    ];
    const where = and(...filters);
    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: apikey.id,
          start: apikey.start,
          enabled: apikey.enabled,
          rateLimitMax: apikey.rateLimitMax,
          rateLimitTimeWindow: apikey.rateLimitTimeWindow,
          requestCount: apikey.requestCount,
          lastRequest: apikey.lastRequest,
          createdAt: apikey.createdAt,
          projectName: apiKeyRequest.name,
          requestStatus: apiKeyRequest.status,
          user: { id: user.id, name: user.name, image: user.image }
        })
        .from(apikey)
        .innerJoin(user, eq(user.id, apikey.referenceId))
        .leftJoin(apiKeyRequest, eq(apiKeyRequest.apiKeyId, apikey.id))
        .where(where)
        .orderBy(desc(apikey.createdAt))
        .limit(size)
        .offset((page - 1) * size),
      db
        .select({ total: count() })
        .from(apikey)
        .innerJoin(user, eq(user.id, apikey.referenceId))
        .leftJoin(apiKeyRequest, eq(apiKeyRequest.apiKeyId, apikey.id))
        .where(where)
    ]);
    return { total, rows };
  }
);

async function getManagedKey(id: string) {
  const { staff } = await requireStaff({ apiKey: ["manage"] });
  const [key] = await db
    .select({
      ownerId: apikey.referenceId,
      enabled: apikey.enabled,
      metadata: apikey.metadata,
      requestId: apiKeyRequest.id,
      requestStatus: apiKeyRequest.status
    })
    .from(apikey)
    .leftJoin(apiKeyRequest, eq(apiKeyRequest.apiKeyId, apikey.id))
    .where(eq(apikey.id, id));
  if (!key) error(404, "API key not found.");
  await requireOutranks(staff, key.ownerId);
  return { staff, key };
}

export const setApiKeyEnabled = command(
  z.object({ id: z.string().min(1), enabled: z.boolean(), note: reviewNote }),
  async ({ id, enabled, note }) => {
    const { staff, key } = await getManagedKey(id);
    // A disabled key revokes its approval; once the owner has moved on, re-enabling would hand out a second key.
    if (enabled && key.requestStatus !== "approved") {
      error(409, "This key’s access request is no longer approved, so it can’t be re-enabled.");
    }
    await db.transaction(async (tx) => {
      await tx.update(apikey).set({ enabled }).where(eq(apikey.id, id));
      await audit(tx, {
        actorId: staff.id,
        action: enabled ? "api_key.enable" : "api_key.disable",
        targetUserId: key.ownerId,
        targetId: id,
        note
      });
    });
    await Promise.all([requested(listApiKeys, 1).refreshAll(), getOverview().refresh()]);
  }
);

export const setApiKeyRateLimit = command(
  z.object({ id: z.string().min(1), max: z.number().int().min(1).max(1_000_000), note: reviewNote }),
  async ({ id, max, note }) => {
    const { staff, key } = await getManagedKey(id);
    await db.transaction(async (tx) => {
      await tx.update(apikey).set({ rateLimitMax: max }).where(eq(apikey.id, id));
      if (key.requestId) {
        // Recorded as an approved increase so regenerated keys keep the new limit.
        await tx.insert(rateLimitRequest).values({
          id: crypto.randomUUID(),
          userId: key.ownerId,
          apiKeyRequestId: key.requestId,
          requestedMax: max,
          reason: "Set by SkyCrypt staff.",
          status: "approved",
          reviewNote: note || null,
          reviewedBy: staff.id,
          reviewedAt: new Date()
        });
      }
      await audit(tx, {
        actorId: staff.id,
        action: "api_key.rate_limit",
        targetUserId: key.ownerId,
        targetId: id,
        note,
        details: { max }
      });
    });
    await requested(listApiKeys, 1).refreshAll();
  }
);

// Better Auth stores JSON fields as text.
function parseJson(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const asObject = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

export const getApiKeyDetail = query(z.string().min(1), async (id) => {
  const { staff } = await requireStaff({ user: ["list"] });
  const [row] = await db
    .select({
      key: apikey,
      owner: { id: user.id, name: user.name, image: user.image, role: user.role },
      request: {
        id: apiKeyRequest.id,
        name: apiKeyRequest.name,
        useCase: apiKeyRequest.useCase,
        url: apiKeyRequest.url,
        description: apiKeyRequest.description,
        status: apiKeyRequest.status
      }
    })
    .from(apikey)
    .innerJoin(user, eq(user.id, apikey.referenceId))
    .leftJoin(apiKeyRequest, eq(apiKeyRequest.apiKeyId, apikey.id))
    .where(eq(apikey.id, id));
  if (!row) error(404, "API key not found.");
  const { key, owner, request } = row;
  const { requestId: _, ...metadata } = asObject(parseJson(key.metadata));
  const scopes = asObject(parseJson(key.permissions)).api;
  const history = await db
    .select({
      id: adminAuditLog.id,
      action: adminAuditLog.action,
      note: adminAuditLog.note,
      createdAt: adminAuditLog.createdAt
    })
    .from(adminAuditLog)
    .where(eq(adminAuditLog.targetId, id))
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(20);
  return {
    key: {
      id: key.id,
      name: key.name,
      start: key.start,
      enabled: !!key.enabled,
      rateLimitEnabled: !!key.rateLimitEnabled,
      rateLimitMax: key.rateLimitMax,
      rateLimitTimeWindow: key.rateLimitTimeWindow,
      requestCount: key.requestCount ?? 0,
      lastRequest: key.lastRequest,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      scopes: Array.isArray(scopes) ? scopes.filter((scope): scope is ApiKeyScope => scope in API_KEY_SCOPES) : [],
      metadata
    },
    owner,
    request,
    history,
    manageable:
      can(staff.role, { apiKey: ["manage"] }) && owner.id !== staff.id && roleRank(owner.role) < roleRank(staff.role)
  };
});

const scopeValues = Object.keys(API_KEY_SCOPES) as [ApiKeyScope, ...ApiKeyScope[]];

export const updateApiKey = form(
  z.object({
    id: z.string().min(1),
    name: z.string().trim().min(3, "Use at least 3 characters.").max(32, "Keep the name under 32 characters."),
    scopes: z.array(z.enum(scopeValues)).default([]),
    metadata: z.string().trim().max(5000, "Keep the metadata under 5000 characters.").default(""),
    note: reviewNote
  }),
  async ({ id, name, scopes, metadata, note }, issue) => {
    const { staff, key } = await getManagedKey(id);
    let extra: Record<string, unknown> = {};
    if (metadata) {
      try {
        extra = JSON.parse(metadata);
      } catch {
        invalid(issue.metadata("Enter valid JSON."));
      }
      if (!extra || typeof extra !== "object" || Array.isArray(extra)) invalid(issue.metadata("Enter a JSON object."));
    }
    // The request link is how regenerated keys keep their settings, so staff can't edit or remove it.
    const { requestId } = asObject(parseJson(key.metadata));
    await auth.api.updateApiKey({
      body: {
        keyId: id,
        userId: key.ownerId,
        name,
        permissions: { api: scopes },
        metadata: { ...extra, ...(requestId ? { requestId } : {}) }
      }
    });
    await audit(db, {
      actorId: staff.id,
      action: "api_key.update",
      targetUserId: key.ownerId,
      targetId: id,
      note,
      details: { name, scopes }
    });
    await Promise.all([getApiKeyDetail(id).refresh(), requested(listApiKeys, 1).refreshAll()]);
  }
);

export const deleteApiKey = command(z.object({ id: z.string().min(1), note: reviewNote }), async ({ id, note }) => {
  const { staff, key } = await getManagedKey(id);
  await db.transaction(async (tx) => {
    // Revoking the request too, so the owner has to request access again instead of generating a fresh key.
    if (key.requestId && key.requestStatus === "approved") {
      await tx.update(apiKeyRequest).set({ status: "revoked" }).where(eq(apiKeyRequest.id, key.requestId));
    }
    await tx.delete(apikey).where(eq(apikey.id, id));
    await audit(tx, { actorId: staff.id, action: "api_key.delete", targetUserId: key.ownerId, targetId: id, note });
  });
  await Promise.all([requested(listApiKeys, 1).refreshAll(), getOverview().refresh()]);
});
