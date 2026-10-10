import { command, getRequestEvent, query } from "$app/server";
import { auth } from "$lib/server/auth";
import {
  getPatreonVerificationRetryAt,
  getStoredPatreonMembership,
  PatreonVerificationError,
  verifyPatreonMembership
} from "$lib/server/patreon";
import { getPerks } from "$routes/(protected)/dashboard/donator-perks/perks.remote";
import { error } from "@sveltejs/kit";

export const getDashboard = query(async () => {
  const { locals, request } = getRequestEvent();
  if (!locals.user) error(401, "Sign in to view your dashboard.");

  const [accounts, membership, verificationRetryAt] = await Promise.all([
    auth.api.listUserAccounts({ headers: request.headers }),
    getStoredPatreonMembership(locals.user.id),
    getPatreonVerificationRetryAt(locals.user.id)
  ]);
  const { id, name, image, createdAt } = locals.user;

  return {
    user: { id, name, image, createdAt },
    accounts: accounts.map(({ id, providerId, accountId, createdAt }) => ({ id, providerId, accountId, createdAt })),
    membership,
    verificationRetryAt
  };
});

export const verifyMembership = command(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, "Sign in before verifying Patreon membership.");

  try {
    await verifyPatreonMembership(locals.user.id);
  } catch (cause) {
    if (cause instanceof PatreonVerificationError) {
      let status;
      switch (cause.code) {
        case "rate_limited":
          status = 429;
          console.warn("Patreon verification rate limited", cause);
          break;
        case "already_claimed":
          status = 409;
          console.warn("Patreon verification already claimed", cause);
          break;
        default:
          status = 400;
          console.error("Patreon verification failed", cause);
      }
      error(status, cause.message);
    }
    console.error("Unexpected Patreon verification failure", cause);
    error(500, "Patreon verification failed unexpectedly.");
  }

  await getDashboard().refresh();
  await getPerks().refresh();
});
