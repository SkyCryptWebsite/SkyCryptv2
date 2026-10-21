import { command, getRequestEvent, query } from "$app/server";
import { getPerks } from "$routes/(protected)/dashboard/donator-perks/perks.remote";
import { error } from "@sveltejs/kit";
import { log } from "evlog";
import { auth } from "#lib/server/auth";
import { getDiscordProfile } from "#lib/server/discord-profile";
import {
  getPatreonVerificationRetryAt,
  getStoredPatreonMembership,
  PatreonVerificationError,
  verifyPatreonMembership
} from "#lib/server/patreon";
import { can } from "#lib/shared/roles";

export const getDashboard = query(async () => {
  const { locals, request } = getRequestEvent();
  if (!locals.user) error(401, "Sign in to view your dashboard.");

  const [accounts, membership, verificationRetryAt, discord] = await Promise.all([
    auth.api.listUserAccounts({ headers: request.headers }),
    getStoredPatreonMembership(locals.user.id),
    getPatreonVerificationRetryAt(locals.user.id),
    getDiscordProfile(locals.user.id)
  ]);
  const { id, name, image, createdAt, developerMode, role } = locals.user;

  return {
    user: {
      id,
      name,
      image,
      createdAt,
      developerMode: developerMode ?? false,
      staff: can(role, { dashboard: ["view"] })
    },
    accounts: accounts.map(({ id, providerId, accountId, createdAt }) => ({ id, providerId, accountId, createdAt })),
    membership,
    verificationRetryAt,
    discord
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
          log.warn({ action: "patreon.verify_rate_limited", userId: locals.user.id, error: cause });
          break;
        case "already_claimed":
          status = 409;
          log.warn({ action: "patreon.verify_already_claimed", userId: locals.user.id, error: cause });
          break;
        default:
          status = 400;
          log.error({ action: "patreon.verify_failed", userId: locals.user.id, error: cause });
      }
      error(status, cause.message);
    }
    log.error({ action: "patreon.verify_unexpected", userId: locals.user.id, error: cause });
    error(500, "Patreon verification failed unexpectedly.");
  }

  await getDashboard().refresh();
  await getPerks().refresh();
});
