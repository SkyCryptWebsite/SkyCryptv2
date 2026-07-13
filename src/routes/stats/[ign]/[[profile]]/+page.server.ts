import { getProfileEmbed, getSelectedProfileEmbed } from "$lib/shared/api/skycrypt-api.remote";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
  const { ign: paramPlayer, profile: paramProfile = null } = params;

  return {
    embed: paramProfile ? await getProfileEmbed({ uuid: paramPlayer, profileId: paramProfile }) : await getSelectedProfileEmbed({ uuid: paramPlayer })
  };
}) satisfies PageServerLoad;
