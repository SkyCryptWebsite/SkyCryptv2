import { REDIS } from "$lib/server/db/redis";
import { getDisplayName, getProfiles } from "$lib/server/lib";
import * as stats from "$lib/server/stats/stats";
import type { MuseumRawResponse, Profile, Stats } from "$types/global";
import type { Player } from "$types/raw/player/lib";

const { getAccessories, getPets, getMainStats, getCollections } = stats;

export async function getStats(profile: Profile, player: Player, extra: { museum?: MuseumRawResponse; packs?: string[] } = {}): Promise<Stats> {
  const ignoredPacks = extra.packs ?? [];

  const timeNow = Date.now();
  const cache = await REDIS.get(`STATS:${profile.uuid}`);
  if (cache && process.env.NODE_ENV !== "development") {
    console.log(`[CACHE] Found cache for ${profile.uuid} in ${Date.now() - timeNow}ms`);
    return JSON.parse(cache);
  }

  const userProfile = profile.members[profile.uuid];
  const userMuseum = extra.museum ? extra.museum[profile.uuid] : null;

  const timeNowv2 = Date.now();
  const items = await stats.getItems(userProfile, userMuseum, ignoredPacks);
  console.log(`[ITEMS] Took ${Date.now() - timeNowv2}ms`);
  // prettier-ignore
  const [profiles, mainStats, accessories, pets, collections] = await Promise.all([
  getProfiles(profile.uuid),
  getMainStats(userProfile, profile, items),
  getAccessories(userProfile, items, ignoredPacks),
  getPets(userProfile, items.pets, profile),
  getCollections(userProfile, profile)
]);

  const output = {
    displayName: getDisplayName(player.displayname, profile.uuid),
    username: player.displayname,
    uuid: profile.uuid,
    profile_id: profile.profile_id,
    profile_cute_name: profile.cute_name,
    game_mode: profile.game_mode,
    selected: profile.selected,
    members: Object.keys(profile.members).filter((uuid) => uuid !== profile.uuid),
    rank: stats.getRank(player),
    social: player.socialMedia?.links ?? {},
    profiles: profiles.filter((p) => p.profile_id !== profile.profile_id),
    skills: stats.getSkills(userProfile, profile, player),
    skyblock_level: stats.getSkyblockLevel(userProfile),
    stats: mainStats,
    items: items,
    accessories: accessories,
    pets: pets,
    mining: stats.getMining(userProfile, player, ignoredPacks),
    farming: stats.getFarming(profile, userProfile),
    enchanting: stats.getEnchanting(userProfile),
    fishing: stats.getFishing(userProfile),
    slayer: stats.getSlayer(userProfile),
    dungeons: stats.getDungeons(userProfile),
    minions: stats.getMinions(profile),
    bestiary: stats.getBestiary(userProfile),
    collections: collections,
    crimson_isle: stats.getCrimsonIsle(userProfile),
    rift: stats.getRift(userProfile),
    misc: stats.getMisc(userProfile, profile, player)
  };

  REDIS.SETEX(`STATS:${profile.uuid}`, 60 * 5, JSON.stringify(output));

  return output;
}
