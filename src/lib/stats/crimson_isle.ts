import type { Member } from "$types/global";
import * as constants from "$constants/constants";

function getDojoRank(points: number) {
  if (points >= 1000) {
    return "S";
  } else if (points >= 800) {
    return "A";
  } else if (points >= 600) {
    return "B";
  } else if (points >= 400) {
    return "C";
  } else if (points >= 200) {
    return "D";
  }

  return "F";
}

function getDojo(userProfile: Member) {
  const output = [];
  for (const [id, data] of Object.entries(constants.DOJO)) {
    output.push({
      name: data.name,
      id: id,
      texture: data.texture,
      points: userProfile.nether_island_player_data?.dojo?.[`dojo_points_${id}`] ?? 0,
      time: userProfile.nether_island_player_data?.dojo?.[`dojo_time_${id}`] ?? 0,
      rank: getDojoRank(userProfile.nether_island_player_data?.dojo?.[`dojo_points_${id}`] ?? 0)
    });
  }

  return {
    totalPoints: Object.keys(constants.DOJO).reduce((acc, id) => acc + (userProfile.nether_island_player_data?.dojo?.[`dojo_points_${id}`] ?? 0), 0),
    challenges: output
  };
}

function getKuudra(userProfile: Member) {
  const output = [];
  for (const [id, data] of Object.entries(constants.KUUDRA_TIERS)) {
    output.push({
      name: data.name,
      id: id,
      head: data.head,
      kills: userProfile.nether_island_player_data?.kuudra_completed_tiers?.[id] ?? 0
    });
  }

  return {
    totalKills: Object.keys(constants.KUUDRA_TIERS).reduce((acc, id) => acc + (userProfile.nether_island_player_data?.kuudra_completed_tiers?.[id] ?? 0), 0),
    tiers: output
  };
}

export function getCrimsonIsle(userProfile: Member) {
  return {
    factions: {
      selectedFaction: userProfile.nether_island_player_data?.selected_faction ?? "none",
      barbariansReputation: userProfile.nether_island_player_data?.barbarians_reputation ?? 0,
      magesReputation: userProfile.nether_island_player_data?.mages_reputation ?? 0
    },
    kuudra: getKuudra(userProfile),
    dojo: getDojo(userProfile)
  };
}
