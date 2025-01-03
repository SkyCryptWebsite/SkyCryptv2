import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";
import type { Member, Misc, Profile } from "$types/global";
import type { Player } from "$types/raw/player/lib";

function formatMiscData(data: Record<string, number> | null) {
  if (!data) {
    return { total: 0 };
  }

  return {
    ...data,
    total:
      Object.keys(data)
        .filter((key) => key !== "total")
        .reduce((acc, key) => acc + data[key], 0) ?? 0
  };
}

function getEssence(userProfile: Member) {
  const output = [];
  for (const [id, essence] of Object.entries(constants.ESSENCE)) {
    output.push({
      name: essence.name,
      id: id,
      texture: essence.texture,
      amount: (userProfile.currencies?.essence && userProfile.currencies.essence[id.toUpperCase()]?.current) ?? 0
    });
  }

  return output;
}

function formatKillsAndDeaths(userProfile: Member) {
  const kills = [] as { id: string; name: string; amount: number }[];
  for (const id in userProfile.player_stats?.kills ?? {}) {
    if (id === "total") {
      continue;
    }

    kills.push({
      id: id,
      name: constants.MOB_NAMES[id] ?? id.split("_").map(helper.titleCase).join(" "),
      amount: userProfile.player_stats.kills[id] ?? 0
    });
  }

  const deaths = [] as { id: string; name: string; amount: number }[];
  for (const id in userProfile.player_stats?.deaths ?? {}) {
    if (id === "total") {
      continue;
    }

    deaths.push({
      id: id,
      name: constants.MOB_NAMES[id] ?? id.split("_").map(helper.titleCase).join(" "),
      amount: userProfile.player_stats.deaths[id] ?? 0
    });
  }

  return {
    total_kills: kills.reduce((acc, mob) => acc + mob.amount, 0),
    total_deaths: deaths.reduce((acc, mob) => acc + mob.amount, 0),
    kills: kills.sort((a, b) => b.amount - a.amount),
    deaths: deaths.sort((a, b) => b.amount - a.amount)
  };
}

function getRaces(userProfile: Member) {
  const output: Misc["races"] = {};

  const races = userProfile.player_stats?.races;
  for (let [id, data] of Object.entries(races ?? {})) {
    if (typeof data === "number") {
      output.other = output.other ?? {
        name: "Other",
        races: {}
      };

      const raceId = id.replace("_best_time", "");
      const raceName = constants.RACE_NAMES[raceId] ?? helper.titleCase(raceId.replace("_", " "));

      output.other.races[raceId] = {
        name: raceName,
        time: data
      };

      if (Object.keys(output.other.races).length === 0) {
        output.other.races[raceId] = null;
      }
    } else {
      for ([id, data] of Object.entries(data)) {
        const shortId = id.split("_").slice(0, 2).join("_");
        const raceId = id.replace(`${shortId}_`, "").replace("_best_time", "");
        const raceName = constants.RACE_NAMES[shortId] ?? helper.titleCase(shortId.replace("_", " "));

        output[shortId] = output[shortId] ?? {
          name: raceName,
          races: {
            with_return: {},
            no_return: {}
          }
        };

        const isReturn = id.endsWith("_with_return_best_time");
        const dungeonRaceId = raceId.replace(isReturn ? "_with_return" : "_no_return", "");

        const raceType = isReturn ? "with_return" : "no_return";
        if (output[shortId].races[raceType] !== null) {
          (output[shortId].races[raceType] as Misc["races"]["string"]["races"])[dungeonRaceId] = {
            name: constants.RACE_NAMES[dungeonRaceId] ?? dungeonRaceId.split("_").map(helper.titleCase).join(" "),
            time: data
          };
        }

        if (output[shortId].races.with_return && Object.keys(output[shortId].races.with_return).length === 0) {
          output[shortId].races.with_return = null;
        }

        if (output[shortId].races.no_return && Object.keys(output[shortId].races.no_return).length === 0) {
          output[shortId].races.no_return = null;
        }
      }
    }
  }

  if (Object.keys(output).length === 0) {
    return null;
  }

  return output;
}

function getDragons(userProfile: Member) {
  const lastDragonHits = Object.keys(userProfile.player_stats?.kills ?? {})
    .filter((key) => key.endsWith("_dragon") && !key.startsWith("master_wither_king"))
    .reduce((obj, key) => ({ ...obj, [key.replace("_dragon", "")]: userProfile.player_stats.kills[key] }), {}) as Record<string, number>;

  Object.assign(lastDragonHits, { total: Object.values(lastDragonHits).reduce((a, b) => a + b, 0) });

  const dragonDeaths = Object.keys(userProfile.player_stats?.deaths ?? {})
    .filter((key) => key.endsWith("_dragon") && !key.startsWith("master_wither_king"))
    .reduce((obj, key) => ({ ...obj, [key.replace("_dragon", "")]: userProfile.player_stats.deaths[key] }), {}) as Record<string, number>;

  Object.assign(dragonDeaths, { total: Object.values(dragonDeaths).reduce((a, b) => a + b, 0) });

  const output = {
    ender_crystals_destroyed: userProfile.player_stats?.end_island?.dragon_fight?.ender_crystals_destroyed,
    most_damage: userProfile.player_stats?.end_island?.dragon_fight?.most_damage,
    fastest_kill: userProfile.player_stats?.end_island?.dragon_fight?.fastest_kill,
    last_hits: Object.keys(lastDragonHits).length > 1 ? lastDragonHits : null,
    deaths: Object.keys(dragonDeaths).length > 1 ? dragonDeaths : null
  };

  if (Object.values(output).every((x) => !x)) {
    return null;
  }

  return output;
}

function getPetMilestone(type: string, amount: number) {
  return {
    amount: amount ?? 0,
    rarity: constants.MILESTONE_RARITIES[constants.PET_MILESTONES[type].findLastIndex((x) => amount >= x)] ?? "common",
    total: amount,
    progress: amount ? Math.min((amount / (constants.PET_MILESTONES[type].at(-1) ?? 1)) * 100, 100).toFixed(2) : "0"
  };
}

function getProfileUpgrades(profile: Profile) {
  const output = {} as Record<string, number>;
  for (const upgrade in constants.PROFILE_UPGRADES) {
    output[upgrade] = 0;
  }

  if (profile.community_upgrades?.upgrade_states != undefined) {
    for (const u of profile.community_upgrades.upgrade_states) {
      output[u.upgrade] = Math.max(output[u.upgrade] || 0, u.tier);
    }
  }

  return output;
}

function getClaimedItems(player: Player) {
  const output = {} as Record<string, number>;
  for (const item in constants.CLAIMABLE_ITEMS) {
    if (player[item as keyof Player] != undefined) {
      output[item] = player[item as keyof Player] as unknown as number;
    }
  }

  for (const key of Object.keys(player).filter((key) => key.startsWith("scorpius_bribe_"))) {
    output[key] = player[key as keyof Player] as unknown as number;
  }

  return output;
}

export function getMisc(userProfile: Member, profile: Profile, player: Player) {
  return {
    essence: getEssence(userProfile),
    kills: formatKillsAndDeaths(userProfile),
    races: getRaces(userProfile),
    gifts: {
      given: userProfile.player_stats?.gifts?.total_given ?? 0,
      received: userProfile.player_stats?.gifts?.total_received ?? 0
    },
    season_of_jerry: {
      most_snowballs_hit: userProfile.player_stats?.winter?.most_snowballs_hit ?? 0,
      most_damage_dealt: userProfile.player_stats?.winter?.most_damage_dealt ?? 0,
      most_magma_damage_dealt: userProfile.player_stats?.winter?.most_magma_damage_dealt ?? 0,
      most_cannonballs_hit: userProfile.player_stats?.winter?.most_cannonballs_hit ?? 0
    },
    dragons: getDragons(userProfile),
    endstone_protector: {
      kills: userProfile.player_stats?.kills?.corrupted_protector ?? 0,
      deaths: userProfile.player_stats?.deaths?.corrupted_protector ?? 0
    },
    damage: {
      highest_critical_damage: userProfile.player_stats?.highest_critical_damage ?? 0
    },
    pet_milestones: {
      sea_creatures_killed: getPetMilestone("sea_creatures_killed", userProfile.player_stats?.pets?.milestone?.sea_creatures_killed ?? 0),
      ores_mined: getPetMilestone("ores_mined", userProfile?.player_stats?.pets?.milestone.ores_mined ?? 0)
    },
    mythological_event: userProfile.player_stats?.mythos ?? null,
    effects: {
      active: userProfile.player_data?.active_effects || [],
      paused: userProfile.player_data?.paused_effects || [],
      disabled: userProfile.player_data?.disabled_potion_effects || []
    },
    profile_upgrades: getProfileUpgrades(profile),
    auctions: {
      bids: userProfile.player_stats?.auctions?.bids ?? 0,
      highest_bid: userProfile.player_stats?.auctions?.highest_bid ?? 0,
      won: userProfile.player_stats?.auctions?.won ?? 0,
      total_bought: formatMiscData(userProfile.player_stats?.auctions?.total_bought),
      gold_spent: userProfile.player_stats?.auctions?.gold_spent ?? 0,
      created: userProfile.player_stats?.auctions?.created ?? 0,
      fees: userProfile.player_stats?.auctions?.fees ?? 0,
      completed: userProfile.player_stats?.auctions?.completed ?? 0,
      total_sold: formatMiscData(userProfile.player_stats?.auctions?.total_sold),
      gold_earned: userProfile.player_stats?.auctions?.gold_earned ?? 0,
      no_bids: userProfile.player_stats?.auctions?.no_bids ?? 0
    },
    claimed_items: getClaimedItems(player),
    uncategorized: {
      soulflow: userProfile.item_data?.soulflow ?? 0,
      teleporter_pill_consumed: userProfile.item_data?.teleporter_pill_consumed ?? false,
      reaper_peppers_eaten: userProfile.player_data?.reaper_peppers_eaten ?? 0,
      personal_bank: constants.BANK_COOLDOWN[userProfile.profile?.personal_bank_upgrade ?? 0] ?? "Unknown"
    }
  };
}
