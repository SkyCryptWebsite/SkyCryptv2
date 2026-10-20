import {
  getProfileEmbed,
  getProfileStats,
  getSelectedProfileEmbed,
  getSelectedProfileStats
} from "#lib/shared/api/skycrypt-api.remote";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, isDataRequest }) => {
  const { ign: paramPlayer, profile: paramProfile = null } = params;
  const embed = Promise.resolve(
    paramProfile
      ? getProfileEmbed({ uuid: paramPlayer, profileId: paramProfile })
      : getSelectedProfileEmbed({ uuid: paramPlayer })
  );

  // Crawlers and Discord only read the server-rendered head, so await it there. Client-side navigations stream it
  // instead of waiting on the embed before the page can start loading.
  if (!isDataRequest) {
    // Starts the page's profile query now so it runs alongside the embed; the render reuses it from the request cache.
    // Argument shape and key order must match the call in +page.svelte.
    (paramProfile
      ? getProfileStats({ uuid: paramPlayer, profileId: paramProfile })
      : getSelectedProfileStats({ uuid: paramPlayer })
    ).catch(() => {});
    return { embed: await embed };
  }
  // Marks a streamed rejection as handled; the page reports load errors from its own stats boundary.
  embed.catch(() => {});
  return { embed };
}) satisfies PageServerLoad;
