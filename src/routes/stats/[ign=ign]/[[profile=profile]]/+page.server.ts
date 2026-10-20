import { getProfileEmbed, getSelectedProfileEmbed } from "#lib/shared/api/skycrypt-api.remote";
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
  if (!isDataRequest) return { embed: await embed };
  // Marks a streamed rejection as handled; the page reports load errors from its own stats boundary.
  embed.catch(() => {});
  return { embed };
}) satisfies PageServerLoad;
