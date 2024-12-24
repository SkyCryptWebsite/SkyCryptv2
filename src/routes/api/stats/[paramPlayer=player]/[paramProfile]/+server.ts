import { fetchMuseum, fetchPlayer, getProfile } from "$lib/server/lib";
import { getStats } from "$lib/server/stats";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const timeNow = Date.now();
  const { paramPlayer, paramProfile } = params;

  const [profile, player] = await Promise.all([getProfile(paramPlayer, paramProfile, { cache: true }), fetchPlayer(paramPlayer, { cache: true })]);
  const museum = await fetchMuseum(profile.profile_id);

  const packs = [] as string[];
  // const packs = ["FURFSKY_REBORN", "RNBW_PLUS", "SKYBLOCK_PACK", "HYPIXELPLUS", "WORLDS_AND_BEYOND", "VANILLA_PLUS"];
  const stats = await getStats(profile, player, { museum, packs: packs });

  console.log(`/api/stats/${paramPlayer}/${paramProfile} took ${Date.now() - timeNow}ms`);
  return json(stats);
};
