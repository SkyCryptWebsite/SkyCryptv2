import { command, form, getRequestEvent, query } from "$app/server";
import { error, invalid } from "@sveltejs/kit";
import { and, desc, eq, isNull, TransactionRollbackError } from "drizzle-orm";
import {
  getEffectiveStatus,
  getRateLimitBlockReason,
  getReapplyAt,
  getRequestBlockReason
} from "#lib/server/api-key-requests";
import { auth } from "#lib/server/auth";
import { db } from "#lib/server/db";
import { apikey, apiKeyRequest, rateLimitRequest } from "#lib/server/db/schema";
import { getStoredMinecraftAccounts } from "#lib/server/minecraft-accounts";
import { verifyTurnstile } from "#lib/server/turnstile";
import { apiKeyRequestSchema, rateLimitRequestSchema } from "#lib/shared/api-key-request";

async function requireDeveloper() {
  const { request } = getRequestEvent();
  const session = await auth.api.getSession({ headers: request.headers, query: { disableCookieCache: true } });
  if (!session) error(401, "Sign in to manage API access.");
  if (!session.user.developerMode) error(403, "Turn on developer mode in your account settings first.");
  return { user: session.user, headers: request.headers };
}

async function getAccessState(userId: string, headers: Headers) {
  const [request] = await db
    .select()
    .from(apiKeyRequest)
    .where(eq(apiKeyRequest.userId, userId))
    .orderBy(desc(apiKeyRequest.createdAt))
    .limit(1);
  const key = request?.apiKeyId
    ? await auth.api.getApiKey({ query: { id: request.apiKeyId }, headers }).catch(() => null)
    : null;
  const [rateLimit] = request
    ? await db
        .select()
        .from(rateLimitRequest)
        .where(eq(rateLimitRequest.apiKeyRequestId, request.id))
        .orderBy(desc(rateLimitRequest.createdAt))
        .limit(1)
    : [];
  return {
    request: request && { ...request, status: getEffectiveStatus(request.status, key?.enabled) },
    key,
    rateLimit
  };
}

type KeySettings = {
  name?: string | null;
  metadata?: Record<string, unknown> | null;
  permissions?: Record<string, string[]> | null;
};

/**
 * Creates a key for an approved request, carrying over any rate limit increase staff approved for it and, when
 * regenerating, the name, metadata and scopes of the key it replaces.
 */
async function createKey(userId: string, requestId: string, name: string, previous?: KeySettings) {
  const [approved] = await db
    .select({ requestedMax: rateLimitRequest.requestedMax })
    .from(rateLimitRequest)
    .where(and(eq(rateLimitRequest.apiKeyRequestId, requestId), eq(rateLimitRequest.status, "approved")))
    .orderBy(desc(rateLimitRequest.reviewedAt))
    .limit(1);
  // Server-side creation: browsers can't call /api-key/create (see the auth hooks).
  return auth.api.createApiKey({
    body: {
      userId,
      name: previous?.name || name,
      metadata: { ...previous?.metadata, requestId },
      // The plugin-wide rate limit is off (see auth.ts), which would otherwise be the default for new keys.
      rateLimitEnabled: true,
      ...(previous?.permissions && { permissions: previous.permissions }),
      ...(approved && { rateLimitMax: approved.requestedMax })
    }
  });
}

export const getApiAccess = query(async () => {
  const { user, headers } = await requireDeveloper();
  const [{ request, key, rateLimit }, minecraftAccounts] = await Promise.all([
    getAccessState(user.id, headers),
    getStoredMinecraftAccounts(user.id)
  ]);
  return {
    minecraftLinked: minecraftAccounts.length > 0,
    reapplyAt: getReapplyAt(request),
    rateLimitRequest: rateLimit && {
      requestedMax: rateLimit.requestedMax,
      status: rateLimit.status,
      reviewNote: rateLimit.reviewNote,
      createdAt: rateLimit.createdAt
    },
    rateLimitReapplyAt: getReapplyAt(rateLimit),
    request: request && {
      name: request.name,
      useCase: request.useCase,
      description: request.description,
      url: request.url,
      status: request.status,
      reviewNote: request.reviewNote,
      createdAt: request.createdAt,
      reviewedAt: request.reviewedAt
    },
    key: key && {
      start: key.start,
      enabled: key.enabled,
      createdAt: key.createdAt,
      lastRequest: key.lastRequest,
      rateLimitMax: key.rateLimitMax,
      rateLimitTimeWindow: key.rateLimitTimeWindow
    }
  };
});

export const submitApiKeyRequest = form(
  apiKeyRequestSchema,
  async ({ _captchaToken, acceptTerms: _, ...fields }, issue) => {
    const { user, headers } = await requireDeveloper();
    const { getClientAddress, locals } = getRequestEvent();
    const [{ request }, minecraftAccounts] = await Promise.all([
      getAccessState(user.id, headers),
      getStoredMinecraftAccounts(user.id)
    ]);
    const blocked = getRequestBlockReason(request, minecraftAccounts.length > 0);
    if (blocked) invalid(blocked);
    if (!(await verifyTurnstile(_captchaToken, getClientAddress()))) {
      invalid(issue._captchaToken("Captcha verification failed. Please try again."));
    }

    const created = await db.transaction(async (tx) => {
      if (request?.status === "revoked") {
        // Close the revoked approval so the one-open-request index admits the new request.
        await tx.update(apiKeyRequest).set({ status: "revoked" }).where(eq(apiKeyRequest.id, request.id));
      }
      const [row] = await tx
        .insert(apiKeyRequest)
        .values({ id: crypto.randomUUID(), userId: user.id, ...fields, termsAcceptedAt: new Date() })
        // The partial unique index rejects a second open request from a concurrent submission.
        .onConflictDoNothing()
        .returning({ id: apiKeyRequest.id });
      return row;
    });
    if (!created) invalid("You already have an open API access request.");
    locals.log.set({ apiKeyRequest: { action: "submitted", id: created.id, useCase: fields.useCase } });
    await getApiAccess().refresh();
  }
);

export const withdrawApiKeyRequest = command(async () => {
  const { user } = await requireDeveloper();
  const [withdrawn] = await db
    .delete(apiKeyRequest)
    .where(and(eq(apiKeyRequest.userId, user.id), eq(apiKeyRequest.status, "pending")))
    .returning({ id: apiKeyRequest.id });
  if (!withdrawn) error(404, "There is no pending request to withdraw.");
  await getApiAccess().refresh();
});

export const generateApiKey = command(async () => {
  const { user, headers } = await requireDeveloper();
  const { locals } = getRequestEvent();
  const { request } = await getAccessState(user.id, headers);
  if (request?.status !== "approved") error(403, "Your API access request hasn’t been approved.");
  if (request.apiKeyId) error(409, "Delete your current key before generating a new one.");

  const created = await createKey(user.id, request.id, request.name);
  const [claimed] = await db
    .update(apiKeyRequest)
    .set({ apiKeyId: created.id })
    .where(and(eq(apiKeyRequest.id, request.id), eq(apiKeyRequest.status, "approved"), isNull(apiKeyRequest.apiKeyId)))
    .returning({ id: apiKeyRequest.id });
  if (!claimed) {
    await db.delete(apikey).where(eq(apikey.id, created.id));
    error(409, "A key was already generated for this request.");
  }
  locals.log.set({ apiKeyRequest: { action: "key_generated", id: request.id } });
  await getApiAccess().refresh();
  return created.key;
});

export const deleteApiKey = command(async () => {
  const { user, headers } = await requireDeveloper();
  const { locals } = getRequestEvent();
  const { request, key } = await getAccessState(user.id, headers);
  // A disabled key is "revoked": it stays as a record and is replaced through a new request instead.
  if (request?.status !== "approved" || !key) error(404, "You don’t have an active API key to delete.");
  await auth.api.deleteApiKey({ body: { keyId: key.id }, headers });
  locals.log.set({ apiKeyRequest: { action: "key_deleted", id: request.id } });
  await getApiAccess().refresh();
});

export const regenerateApiKey = command(async () => {
  const { user, headers } = await requireDeveloper();
  const { locals } = getRequestEvent();
  const { request, key } = await getAccessState(user.id, headers);
  if (request?.status !== "approved" || !key) error(404, "You don’t have an active API key to regenerate.");

  const created = await createKey(user.id, request.id, request.name, key);
  try {
    await db.transaction(async (tx) => {
      const [swapped] = await tx
        .update(apiKeyRequest)
        .set({ apiKeyId: created.id })
        .where(
          and(
            eq(apiKeyRequest.id, request.id),
            eq(apiKeyRequest.status, "approved"),
            eq(apiKeyRequest.apiKeyId, key.id)
          )
        )
        .returning({ id: apiKeyRequest.id });
      // Only replace a key that is still enabled, so a key staff disable mid-request can't be swapped out.
      const [replaced] = swapped
        ? await tx
            .delete(apikey)
            .where(and(eq(apikey.id, key.id), eq(apikey.enabled, true)))
            .returning({ id: apikey.id })
        : [];
      if (!replaced) tx.rollback();
    });
  } catch (cause) {
    await db.delete(apikey).where(eq(apikey.id, created.id));
    if (cause instanceof TransactionRollbackError) error(409, "Your API key changed. Refresh the page and try again.");
    throw cause;
  }
  locals.log.set({ apiKeyRequest: { action: "key_regenerated", id: request.id } });
  await getApiAccess().refresh();
  return created.key;
});

export const submitRateLimitRequest = form(rateLimitRequestSchema, async ({ requestedMax, reason }, issue) => {
  const { user, headers } = await requireDeveloper();
  const { locals } = getRequestEvent();
  const { request, key, rateLimit } = await getAccessState(user.id, headers);
  if (request?.status !== "approved" || !key) invalid("Generate an API key before asking for a higher rate limit.");
  const blocked = getRateLimitBlockReason(rateLimit);
  if (blocked) invalid(blocked);
  if (key.rateLimitMax && requestedMax <= key.rateLimitMax) {
    invalid(issue.requestedMax(`Ask for more than your current ${key.rateLimitMax} requests.`));
  }

  const [created] = await db
    .insert(rateLimitRequest)
    .values({ id: crypto.randomUUID(), userId: user.id, apiKeyRequestId: request.id, requestedMax, reason })
    // The partial unique index rejects a second pending request from a concurrent submission.
    .onConflictDoNothing()
    .returning({ id: rateLimitRequest.id });
  if (!created) invalid("Your rate limit request is still being reviewed.");
  locals.log.set({ rateLimitRequest: { action: "submitted", id: created.id, requestedMax } });
  await getApiAccess().refresh();
});
