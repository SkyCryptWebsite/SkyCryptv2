import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { auth } from "#lib/server/auth";
import {
  fetchMcIdProfile,
  getMcIdLinks,
  getStoredMinecraftAccounts,
  storeMinecraftAccounts
} from "#lib/server/minecraft-accounts";

export const getMinecraftAccounts = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, "Sign in to view Minecraft accounts.");
  return getStoredMinecraftAccounts(locals.user.id);
});

export const syncMinecraftAccounts = command(async () => {
  const { locals, request } = getRequestEvent();
  if (!locals.user) error(401, "Sign in to sync Minecraft accounts.");
  const links = await getMcIdLinks(locals.user.id);
  if (!links.length) error(400, "Link MC-ID before syncing Minecraft accounts.");
  let banned = false;
  for (const link of links) {
    let accessToken: string;
    try {
      ({ accessToken } = await auth.api.getAccessToken({ headers: request.headers, body: { accountId: link.id } }));
    } catch {
      return { reconnect: true };
    }
    try {
      const profile = await fetchMcIdProfile(accessToken);
      if (!profile) return { reconnect: true };
      banned = await storeMinecraftAccounts(link, profile);
    } catch {
      error(502, "Couldn’t sync Minecraft accounts from MC-ID. Try again or reconnect MC-ID.");
    }
    if (banned) error(403, "Your account was banned for ban evasion.");
  }
  await getMinecraftAccounts().refresh();
  return { reconnect: false };
});
