const retryTimes = new Map<string, number>();

// ponytail: per-process limits with O(n) cleanup; use a shared TTL cache for high volume or multiple instances.
export function getPatreonVerificationRetryAt(userId: string) {
  const retryAt = retryTimes.get(userId) ?? 0;
  return retryAt > Date.now() ? new Date(retryAt) : null;
}

export function claimPatreonVerification(userId: string) {
  const now = Date.now();
  for (const [id, retryAt] of retryTimes) {
    if (retryAt <= now) retryTimes.delete(id);
  }
  if (retryTimes.has(userId)) return false;
  retryTimes.set(userId, now + 60_000);
  return true;
}
