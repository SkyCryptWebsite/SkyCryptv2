import type { ApiKeyRequestStatus, RateLimitRequestStatus } from "#lib/shared/constants/developer";

export const REAPPLY_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

type LatestRequest =
  | { status: ApiKeyRequestStatus | RateLimitRequestStatus; reviewedAt: Date | null; updatedAt: Date }
  | undefined;

/** Staff revoke an approval by disabling its key; the user may then request a new one. */
export function getEffectiveStatus(status: ApiKeyRequestStatus, keyEnabled: boolean | undefined): ApiKeyRequestStatus {
  return status === "approved" && keyEnabled === false ? "revoked" : status;
}

export function getReapplyAt(request: LatestRequest) {
  if (request?.status !== "denied") return null;
  return new Date((request.reviewedAt ?? request.updatedAt).getTime() + REAPPLY_COOLDOWN_MS);
}

/** Why the user can't submit a new API access request, or `null` when they can. */
export function getRequestBlockReason(request: LatestRequest, minecraftLinked: boolean, now = new Date()) {
  if (!minecraftLinked) return "Link a Minecraft account with MC-ID before requesting API access.";
  if (request?.status === "pending") return "Your API access request is still being reviewed.";
  if (request?.status === "approved") return "You already have API access.";
  const reapplyAt = getReapplyAt(request);
  if (reapplyAt && reapplyAt > now) return "You can request API access again after the cooldown ends.";
  return null;
}

/** Why the user can't ask for a higher rate limit, or `null` when they can. */
export function getRateLimitBlockReason(request: LatestRequest, now = new Date()) {
  if (request?.status === "pending") return "Your rate limit request is still being reviewed.";
  const reapplyAt = getReapplyAt(request);
  if (reapplyAt && reapplyAt > now) return "You can ask for a higher rate limit again after the cooldown ends.";
  return null;
}
