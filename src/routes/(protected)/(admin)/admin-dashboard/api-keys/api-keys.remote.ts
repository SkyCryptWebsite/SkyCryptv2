import { command, query, requested } from "$app/server";
import { error } from "@sveltejs/kit";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { z } from "zod";
import { audit, requireOutranks, requireStaff } from "#lib/server/admin.js";
import { db } from "#lib/server/db/index.js";
import { apikey, apiKeyRequest, rateLimitRequest, user } from "#lib/server/db/schema/index.js";
import { listArgs, reviewNote } from "#lib/shared/admin.js";
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
