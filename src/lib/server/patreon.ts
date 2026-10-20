import {
  PATREON_CLIENT_ID,
  PATREON_CLIENT_SECRET,
  PATREON_CREATOR_ACCESS_TOKEN,
  PATREON_CREATOR_REFRESH_TOKEN,
  PATREON_CAMPAIGN_ID
} from "$app/env/private";
import { PUBLIC_PATREON_COLORED_HEART_CENTS, PUBLIC_PATREON_ANY_EMOJI_CENTS } from "$app/env/public";
import { and, eq, sql } from "drizzle-orm";
import { db } from "#lib/server/db";
import { account, patreonCreatorToken, patreonMembership } from "#lib/server/db/schema";
import { claimPatreonVerification } from "#lib/server/patreon-cooldown";
import {
  findPatreonMembership,
  getPatreonEntitlement,
  type PatreonCampaignMember,
  type PatreonCampaignMembersResponse,
  type PatreonEntitlement
} from "#lib/server/patreon-entitlements";

export { getPatreonVerificationRetryAt } from "#lib/server/patreon-cooldown";

const PATREON_API_URL = "https://www.patreon.com/api/oauth2/v2";
const PATREON_TOKEN_URL = "https://www.patreon.com/api/oauth2/token";
const PATREON_TIMEOUT_MS = 10_000;

export type PatreonMembershipStatus = {
  entitlementLevel: PatreonEntitlement;
  lifetimeSupportCents: number;
  currentlyEntitledAmountCents: number;
  patronStatus: string | null;
  verifiedAt: Date;
};

export class PatreonVerificationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_configured"
      | "not_linked"
      | "not_a_member"
      | "already_claimed"
      | "missing_scope"
      | "rate_limited"
      | "unavailable"
  ) {
    super(message);
    this.name = "PatreonVerificationError";
  }
}

export async function getStoredPatreonMembership(userId: string): Promise<PatreonMembershipStatus | null> {
  const [membership] = await db
    .select({
      entitlementLevel: patreonMembership.entitlementLevel,
      lifetimeSupportCents: patreonMembership.lifetimeSupportCents,
      currentlyEntitledAmountCents: patreonMembership.currentlyEntitledAmountCents,
      patronStatus: patreonMembership.patronStatus,
      verifiedAt: patreonMembership.verifiedAt
    })
    .from(patreonMembership)
    .where(eq(patreonMembership.userId, userId))
    .limit(1);

  return (membership as PatreonMembershipStatus | undefined) ?? null;
}

export async function refreshCreatorAccessToken(campaignId: string, staleAccessToken?: string) {
  const clientId = PATREON_CLIENT_ID?.trim();
  const clientSecret = PATREON_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new PatreonVerificationError("Patreon creator access is not configured.", "not_configured");
  }

  const [stored] = await db
    .select()
    .from(patreonCreatorToken)
    .where(eq(patreonCreatorToken.campaignId, campaignId))
    .limit(1);

  if (!stored) throw new PatreonVerificationError("Patreon creator access is not configured.", "not_configured");
  if (staleAccessToken && stored.accessToken !== staleAccessToken) return stored.accessToken;

  let response: Response;
  try {
    response = await fetch(PATREON_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: stored.refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      }),
      signal: AbortSignal.timeout(PATREON_TIMEOUT_MS)
    });
  } catch {
    throw new PatreonVerificationError("Patreon creator token refresh failed.", "unavailable");
  }

  if (!response.ok) {
    throw new PatreonVerificationError("Patreon creator token refresh failed.", "not_configured");
  }

  const tokens = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new PatreonVerificationError("Patreon returned invalid creator tokens.", "unavailable");
  }

  const expiresAt = Number.isFinite(tokens.expires_in) ? new Date(Date.now() + Number(tokens.expires_in) * 1000) : null;
  await db
    .update(patreonCreatorToken)
    .set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      updatedAt: new Date()
    })
    .where(eq(patreonCreatorToken.campaignId, campaignId));

  return tokens.access_token;
}

async function getCreatorAccessToken(campaignId: string) {
  const accessToken = PATREON_CREATOR_ACCESS_TOKEN?.trim();
  const refreshToken = PATREON_CREATOR_REFRESH_TOKEN?.trim();
  if (!accessToken || !refreshToken || !PATREON_CLIENT_ID || !PATREON_CLIENT_SECRET) {
    throw new PatreonVerificationError("Patreon creator access is not configured.", "not_configured");
  }

  await db.insert(patreonCreatorToken).values({ campaignId, accessToken, refreshToken }).onConflictDoNothing();

  const [stored] = await db
    .select()
    .from(patreonCreatorToken)
    .where(eq(patreonCreatorToken.campaignId, campaignId))
    .limit(1);

  if (stored.expiresAt && stored.expiresAt.getTime() <= Date.now() + 60_000) {
    return refreshCreatorAccessToken(campaignId, stored.accessToken);
  }
  return stored.accessToken;
}

async function fetchCampaignMembership(campaignId: string, patreonUserId: string, initialCreatorToken: string) {
  let cursor: string | undefined;
  let creatorToken = initialCreatorToken;
  const signal = AbortSignal.timeout(PATREON_TIMEOUT_MS);

  do {
    const url = new URL(`${PATREON_API_URL}/campaigns/${campaignId}/members`);
    url.searchParams.set("include", "user");
    url.searchParams.set(
      "fields[member]",
      "campaign_lifetime_support_cents,currently_entitled_amount_cents,patron_status"
    );
    url.searchParams.set("fields[user]", "full_name");
    url.searchParams.set("page[count]", "1000");
    if (cursor) url.searchParams.set("page[cursor]", cursor);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${creatorToken}` },
        signal
      });
    } catch {
      throw new PatreonVerificationError("Patreon verification is temporarily unavailable.", "unavailable");
    }

    if (response.status === 401) {
      creatorToken = await refreshCreatorAccessToken(campaignId, creatorToken);
      try {
        response = await fetch(url, {
          headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${creatorToken}` },
          signal
        });
      } catch {
        throw new PatreonVerificationError("Patreon verification is temporarily unavailable.", "unavailable");
      }
    }

    if (response.status === 401 || response.status === 403) {
      throw new PatreonVerificationError(
        "Patreon creator access is not configured with the campaigns.members permission.",
        "missing_scope"
      );
    }
    if (response.status === 429) {
      throw new PatreonVerificationError(
        "Patreon is rate limiting verification. Please try again later.",
        "rate_limited"
      );
    }
    if (!response.ok) {
      throw new PatreonVerificationError("Patreon verification is temporarily unavailable.", "unavailable");
    }

    const page = (await response.json()) as PatreonCampaignMembersResponse;
    const membership = findPatreonMembership(page, patreonUserId);
    if (membership) return membership;
    cursor = page.meta?.pagination?.cursors?.next ?? undefined;
  } while (cursor);

  return undefined;
}

export async function storePatreonMembership(
  userId: string,
  patreonUserId: string,
  campaignId: string,
  membership: PatreonCampaignMember,
  coloredHeartCents = Number(PUBLIC_PATREON_COLORED_HEART_CENTS ?? 500),
  anyEmojiCents = Number(PUBLIC_PATREON_ANY_EMOJI_CENTS ?? 6000)
): Promise<PatreonMembershipStatus> {
  const lifetimeSupportCents = membership.attributes?.campaign_lifetime_support_cents ?? 0;
  const currentlyEntitledAmountCents = membership.attributes?.currently_entitled_amount_cents ?? 0;
  const patronStatus = membership.attributes?.patron_status ?? null;
  const entitlementLevel = getPatreonEntitlement(lifetimeSupportCents, coloredHeartCents, anyEmojiCents);
  const verifiedAt = new Date();

  const [stored] = await db
    .insert(patreonMembership)
    .values({
      id: crypto.randomUUID(),
      userId,
      patreonUserId,
      memberId: membership.id,
      campaignId,
      lifetimeSupportCents,
      currentlyEntitledAmountCents,
      patronStatus,
      entitlementLevel,
      verifiedAt
    })
    .onConflictDoUpdate({
      target: patreonMembership.userId,
      set: {
        patreonUserId,
        memberId: membership.id,
        campaignId,
        lifetimeSupportCents,
        currentlyEntitledAmountCents,
        patronStatus,
        entitlementLevel: sql`greatest(${patreonMembership.entitlementLevel}, ${entitlementLevel})`,
        verifiedAt,
        updatedAt: verifiedAt
      }
    })
    .returning({
      entitlementLevel: patreonMembership.entitlementLevel,
      lifetimeSupportCents: patreonMembership.lifetimeSupportCents,
      currentlyEntitledAmountCents: patreonMembership.currentlyEntitledAmountCents,
      patronStatus: patreonMembership.patronStatus,
      verifiedAt: patreonMembership.verifiedAt
    });

  return stored as PatreonMembershipStatus;
}

export async function verifyPatreonMembership(userId: string): Promise<PatreonMembershipStatus> {
  const campaignId = PATREON_CAMPAIGN_ID?.trim();
  const coloredHeartCents = Number(PUBLIC_PATREON_COLORED_HEART_CENTS ?? 500);
  const anyEmojiCents = Number(PUBLIC_PATREON_ANY_EMOJI_CENTS ?? 6000);

  if (
    !campaignId ||
    !Number.isSafeInteger(coloredHeartCents) ||
    coloredHeartCents < 0 ||
    !Number.isSafeInteger(anyEmojiCents) ||
    anyEmojiCents < coloredHeartCents
  ) {
    throw new PatreonVerificationError("Patreon verification is not configured.", "not_configured");
  }

  const [linkedAccount] = await db
    .select({ patreonUserId: account.accountId })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "patreon")))
    .limit(1);

  if (!linkedAccount) {
    throw new PatreonVerificationError("Link your Patreon account before verifying membership.", "not_linked");
  }

  if (!claimPatreonVerification(userId)) {
    throw new PatreonVerificationError("Wait one minute before verifying Patreon again.", "rate_limited");
  }
  const creatorToken = await getCreatorAccessToken(campaignId);
  const membership = await fetchCampaignMembership(campaignId, linkedAccount.patreonUserId, creatorToken);
  if (!membership) {
    throw new PatreonVerificationError(
      "This Patreon account is not a member of the SkyCrypt campaign.",
      "not_a_member"
    );
  }

  try {
    return await storePatreonMembership(
      userId,
      linkedAccount.patreonUserId,
      campaignId,
      membership,
      coloredHeartCents,
      anyEmojiCents
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "constraint_name" in error &&
      error.constraint_name === "patreon_membership_memberId_uidx"
    ) {
      throw new PatreonVerificationError("This Patreon account is already linked to another user.", "already_claimed");
    }
    throw error;
  }
}
