import type { Stats, Profile } from "$types/global";
import * as stats from "$lib/server/stats/stats";
import type { Player } from "$types/raw/player/lib";
import { getProfiles } from "$lib/server/lib";

const getAccessories = stats.getAccessories;
const getPets = stats.getPets;
const getMainStats = stats.getMainStats;

export async function getStats(profile: Profile, player: Player): Promise<Stats> {
  const userProfile = profile.members[profile.uuid];

  const items = await stats.getItems(userProfile);
  const [profiles, mainStats, accessories, pets] = await Promise.all([
    getProfiles(profile.uuid),
    getMainStats(userProfile, profile, items),
    getAccessories(
      userProfile,
      items.armor.armor,
      items.talisman_bag,
      items.inventory,
      items.enderchest,
      Object.values(items.backpack)
        .map((i) => i.containsItems ?? [])
        .flat()
    ),
    getPets(userProfile, items.pets, profile)
  ]);

  return {
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
    mining: stats.getMining(userProfile, player),
    farming: stats.getFarming(userProfile),
    fishing: stats.getFishing(userProfile),
    slayer: stats.getSlayer(userProfile),
    dungeons: stats.getDungeons(userProfile),
    minions: stats.getMinions(profile),
    bestiary: stats.getBestiary(userProfile),
    collections: stats.getCollections(userProfile, profile),
    crimson_isle: stats.getCrimsonIsle(userProfile),
    rift: stats.getRift(userProfile),
    misc: stats.getMisc(userProfile, profile, player)
  };
}
