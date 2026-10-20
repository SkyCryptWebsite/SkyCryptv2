import { eq, inArray } from "drizzle-orm";
import { db } from "#lib/server/db";
import {
  account,
  apikey,
  apiKeyRequest,
  discordProfile,
  minecraftAccount,
  patreonMembership,
  profileEmoji,
  rateLimitRequest,
  session,
  user
} from "#lib/server/db/schema";

export async function exportAccountData(userId: string) {
  return db.transaction(
    async (tx) => {
      const [profile] = await tx.select().from(user).where(eq(user.id, userId));
      const accounts = await tx
        .select({
          id: account.id,
          accountId: account.accountId,
          providerId: account.providerId,
          scope: account.scope,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt
        })
        .from(account)
        .where(eq(account.userId, userId));
      const minecraftAccounts = await tx
        .select({
          accountId: minecraftAccount.accountId,
          uuid: minecraftAccount.uuid,
          username: minecraftAccount.username,
          primary: minecraftAccount.primary,
          syncedAt: minecraftAccount.syncedAt
        })
        .from(minecraftAccount)
        .innerJoin(account, eq(minecraftAccount.accountId, account.id))
        .where(eq(account.userId, userId));
      const uuids = minecraftAccounts.map(({ uuid }) => uuid);
      const [discord, membership, sessions, apiKeys, apiKeyRequests, rateLimitRequests, emojis] = await Promise.all([
        tx.select().from(discordProfile).where(eq(discordProfile.userId, userId)),
        tx.select().from(patreonMembership).where(eq(patreonMembership.userId, userId)),
        tx
          .select({
            id: session.id,
            userAgent: session.userAgent,
            ipAddress: session.ipAddress,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            expiresAt: session.expiresAt,
            impersonatedBy: session.impersonatedBy
          })
          .from(session)
          .where(eq(session.userId, userId)),
        tx
          .select({
            id: apikey.id,
            name: apikey.name,
            prefix: apikey.prefix,
            enabled: apikey.enabled,
            createdAt: apikey.createdAt,
            updatedAt: apikey.updatedAt,
            expiresAt: apikey.expiresAt,
            permissions: apikey.permissions,
            metadata: apikey.metadata,
            requestCount: apikey.requestCount,
            lastRequest: apikey.lastRequest,
            remaining: apikey.remaining,
            rateLimitEnabled: apikey.rateLimitEnabled,
            rateLimitTimeWindow: apikey.rateLimitTimeWindow,
            rateLimitMax: apikey.rateLimitMax,
            refillInterval: apikey.refillInterval,
            refillAmount: apikey.refillAmount,
            lastRefillAt: apikey.lastRefillAt
          })
          .from(apikey)
          .where(eq(apikey.referenceId, userId)),
        tx
          .select({
            id: apiKeyRequest.id,
            name: apiKeyRequest.name,
            useCase: apiKeyRequest.useCase,
            description: apiKeyRequest.description,
            url: apiKeyRequest.url,
            status: apiKeyRequest.status,
            reviewNote: apiKeyRequest.reviewNote,
            reviewedAt: apiKeyRequest.reviewedAt,
            apiKeyId: apiKeyRequest.apiKeyId,
            termsAcceptedAt: apiKeyRequest.termsAcceptedAt,
            createdAt: apiKeyRequest.createdAt,
            updatedAt: apiKeyRequest.updatedAt
          })
          .from(apiKeyRequest)
          .where(eq(apiKeyRequest.userId, userId)),
        tx
          .select({
            id: rateLimitRequest.id,
            apiKeyRequestId: rateLimitRequest.apiKeyRequestId,
            requestedMax: rateLimitRequest.requestedMax,
            reason: rateLimitRequest.reason,
            status: rateLimitRequest.status,
            reviewNote: rateLimitRequest.reviewNote,
            reviewedAt: rateLimitRequest.reviewedAt,
            createdAt: rateLimitRequest.createdAt,
            updatedAt: rateLimitRequest.updatedAt
          })
          .from(rateLimitRequest)
          .where(eq(rateLimitRequest.userId, userId)),
        uuids.length ? tx.select().from(profileEmoji).where(inArray(profileEmoji.uuid, uuids)) : Promise.resolve([])
      ]);
      return {
        formatVersion: 1,
        exportedAt: new Date(),
        profile,
        accounts,
        minecraftAccounts,
        discordProfile: discord[0] ?? null,
        patreonMembership: membership[0] ?? null,
        sessions,
        apiKeys,
        apiKeyRequests,
        rateLimitRequests,
        profileEmojis: emojis
      };
    },
    { isolationLevel: "repeatable read", accessMode: "read only" }
  );
}

export async function deleteAccountData(userId: string) {
  await db.transaction(async (tx) => {
    const linked = await tx
      .select({ uuid: minecraftAccount.uuid })
      .from(minecraftAccount)
      .innerJoin(account, eq(minecraftAccount.accountId, account.id))
      .where(eq(account.userId, userId));
    if (linked.length)
      await tx.delete(profileEmoji).where(
        inArray(
          profileEmoji.uuid,
          linked.map(({ uuid }) => uuid)
        )
      );
    await tx.delete(apikey).where(eq(apikey.referenceId, userId));
    // Foreign keys remove sessions, provider accounts, Minecraft links, Discord data, membership, API key and rate limit requests together.
    await tx.delete(user).where(eq(user.id, userId));
  });
}
