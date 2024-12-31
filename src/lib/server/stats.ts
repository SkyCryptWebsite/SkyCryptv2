import { dev } from "$app/environment";
import { REDIS } from "$lib/server/db/redis";
import { getDisplayName, getProfiles, sendWebhookMessage } from "$lib/server/lib";
import * as stats from "$lib/server/stats/stats";
import type { MuseumRawResponse, Profile } from "$types/global";
import type { Player } from "$types/raw/player/lib";
import { stripAllItems } from "./stats/items/stripping";

async function processStats<T>(player: Player, profile: Profile, stats: Array<[string, () => Promise<T>]>, errors: Record<string, string>): Promise<Record<string, T | string>> {
  const result: Record<string, T | string> = {};

  for (const [key, fetchFn] of stats) {
    try {
      result[key] = await fetchFn();
    } catch (error) {
      if (dev) {
        console.log(error);
      }

      const uuid = profile.uuid;
      const username = player.displayname;
      const profileId = profile.profile_id;
      const profileCuteName: string = profile.cute_name;
      await sendWebhookMessage(error as Error, { uuid, username, profileId, profileCuteName });

      errors[key] = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return result;
}

export async function getStats(profile: Profile, player: Player, extra: { museum?: MuseumRawResponse; packs?: string[] } = {}) {
  const timeNow = Date.now();
  const cache = await REDIS.get(`STATS:${profile.uuid}`);
  if (cache && process.env.NODE_ENV !== "development") {
    console.log(`[CACHE] Found cache for ${profile.uuid} in ${Date.now() - timeNow}ms`);
    return JSON.parse(cache);
  }

  const userProfile = profile.members[profile.uuid];
  const userMuseum = extra.museum ? extra.museum[profile.uuid] : null;
  const ignoredPacks = extra.packs ?? [];
  const errors = {};

  const items = await stats.getItems(userProfile, userMuseum, ignoredPacks);

  const statsList = [
    ["members", () => stats.getProfileMembers(profile.members)],
    ["profiles", () => getProfiles(profile.uuid)],
    ["stats", () => stats.getMainStats(userProfile, profile, items)],
    ["accessories", () => stats.getAccessories(userProfile, items, ignoredPacks)],
    ["pets", () => stats.getPets(userProfile, items.pets, profile)],
    ["collections", () => stats.getCollections(userProfile, profile)],
    ["skills", () => stats.getSkills(userProfile, profile, player)],
    ["skyblock_level", () => stats.getSkyblockLevel(userProfile)],
    ["mining", () => stats.getMining(userProfile, player, ignoredPacks)],
    ["farming", () => stats.getFarming(profile, userProfile)],
    ["enchanting", () => stats.getEnchanting(userProfile)],
    ["fishing", () => stats.getFishing(userProfile)],
    ["slayer", () => stats.getSlayer(userProfile)],
    ["dungeons", () => stats.getDungeons(userProfile)],
    ["minions", () => stats.getMinions(profile)],
    ["bestiary", () => stats.getBestiary(userProfile)],
    ["crimson_isle", () => stats.getCrimsonIsle(userProfile)],
    ["rift", () => stats.getRift(userProfile)],
    ["misc", () => stats.getMisc(userProfile, profile, player)],
    ["apiSettings", () => stats.getAPISettings(profile, userProfile, userMuseum)]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as Array<[string, () => Promise<any>]>;

  const results = await processStats(player, profile, statsList, errors);

  const output = {
    displayName: getDisplayName(player.displayname, profile.uuid),
    username: player.displayname,
    uuid: profile.uuid,
    profile_id: profile.profile_id,
    profile_cute_name: profile.cute_name,
    game_mode: profile.game_mode,
    selected: profile.selected,
    rank: stats.getRank(player),
    social: player.socialMedia?.links ?? {},
    items: stripAllItems(items),
    ...results,
    errors
  };

  REDIS.SETEX(`STATS:${profile.uuid}`, 60 * 5, JSON.stringify(output));

  return output;
}
