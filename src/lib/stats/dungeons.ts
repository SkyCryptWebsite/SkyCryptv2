import * as constants from "$constants/constants";
import * as helper from "$lib/helper";
import type { BestRun, Catacombs, Member, Skill } from "$types/global";
import { getBestiaryFamily } from "./bestiary";
import { getLevelByXp } from "./leveling/leveling";

function getDungeonClasses(userProfile: Member) {
  if (userProfile.dungeons.player_classes === undefined) {
    return {};
  }

  return Object.keys(userProfile.dungeons.player_classes).reduce(
    (acc: Record<string, Skill>, key) => {
      acc[key] = getLevelByXp(userProfile.dungeons.player_classes[key].experience, { type: "dungeoneering" });

      return acc;
    },
    {} as Record<string, Skill>
  );
}

function getMostDamage(catacombs: Catacombs, floorId: number) {
  const mostDamageKeys = Object.keys(catacombs).filter((key) => key.startsWith("most_damage_"));

  let maxDamage = 0;
  let maxDamageKey = "";
  mostDamageKeys.forEach((key) => {
    const damage = catacombs[key] as Record<string, number>;

    if (damage[floorId] > maxDamage) {
      maxDamage = damage[floorId];
      maxDamageKey = key;
    }
  });

  return {
    damage: maxDamage,
    type: maxDamageKey.replace("most_damage_", "")
  };
}

export function getScoreGrade(data: BestRun) {
  const totalScore = data.score_exploration + data.score_speed + data.score_skill + data.score_bonus;
  if (totalScore <= 99) {
    return "D";
  } else if (totalScore <= 159) {
    return "C";
  } else if (totalScore <= 229) {
    return "B";
  } else if (totalScore <= 269) {
    return "A";
  } else if (totalScore <= 299) {
    return "S";
  }

  return "S+";
}

function getBestRun(catacombs: Catacombs, floorId: number) {
  const bestRunData = catacombs.best_runs?.[floorId];
  if (!bestRunData) {
    return null;
  }

  const bestRun = Object.values(bestRunData).reduce((a, b) => {
    const aScore = a.score_exploration + a.score_speed + a.score_skill + a.score_bonus;
    const bScore = b.score_exploration + b.score_speed + b.score_skill + b.score_bonus;

    return aScore > bScore ? a : b;
  });

  return {
    grade: getScoreGrade(bestRun),
    timestamp: bestRun.timestamp,
    score_exploration: bestRun.score_exploration,
    score_speed: bestRun.score_speed,
    score_skill: bestRun.score_skill,
    score_bonus: bestRun.score_bonus,
    dungeon_class: bestRun.dungeon_class,
    elapsed_time: bestRun.elapsed_time,
    damage_dealt: bestRun.damage_dealt,
    deaths: bestRun.deaths,
    mobs_killed: bestRun.mobs_killed,
    secrets_found: bestRun.secrets_found,
    damage_mitigated: bestRun.damage_mitigated
  };
}

function getSecrets(catacombs: Member["dungeons"]) {
  const secretsFound = catacombs.secrets ?? 0;
  const totalRuns =
    Object.keys(catacombs?.dungeon_types?.catacombs?.tier_completions || {})
      .filter((key) => key !== "total")
      .reduce((a, b) => a + (catacombs?.dungeon_types?.catacombs?.tier_completions[b] || 0), 0) +
    Object.keys(catacombs?.dungeon_types?.master_catacombs?.tier_completions || {})
      .filter((key) => key !== "total")
      .reduce((a, b) => a + (catacombs?.dungeon_types?.master_catacombs?.tier_completions[b] || 0), 0);

  return {
    found: secretsFound,
    secretsPerRun: secretsFound / totalRuns
  };
}

function formatCatacombsData(catacombs: Catacombs) {
  const type = catacombs.experience ? "catacombs" : "master_catacombs";

  const output = [];
  const floorData = constants.DUNGEONS.floors[type];
  for (const floor of floorData) {
    output.push({
      name: floor.name,
      texture: floor.texture,
      stats: {
        times_played: catacombs.times_played?.[floor.id] ?? 0,
        tier_completions: catacombs.tier_completions?.[floor.id] ?? 0,
        milestone_completions: catacombs.milestone_completions?.[floor.id] ?? 0,
        best_score: catacombs.best_score?.[floor.id] ?? 0,
        mobs_killed: catacombs.mobs_killed?.[floor.id] ?? 0,
        watcher_kills: catacombs.watcher_kills?.[floor.id] ?? 0,
        most_mobs_killed: catacombs.most_mobs_killed?.[floor.id] ?? 0,
        fastest_time: catacombs.fastest_time?.[floor.id] ?? 0,
        fastest_time_s: catacombs.fastest_time?.[floor.id] ?? 0,
        fastest_time_s_plus: catacombs.fastest_time_s_plus?.[floor.id] ?? 0,
        most_healing: catacombs.most_healing?.[floor.id] ?? 0,
        most_damage: getMostDamage(catacombs, floor.id)
      },
      best_run: getBestRun(catacombs, floor.id)
    });
  }

  return output;
}

export function getDungeons(userProfile: Member) {
  if (userProfile.dungeons.dungeon_types === undefined) {
    return null;
  }

  const dungeonClasses = getDungeonClasses(userProfile);

  return {
    level: getLevelByXp(userProfile.dungeons.dungeon_types.catacombs.experience, { type: "dungeoneering" }),
    classes: {
      selectedClass: helper.titleCase(userProfile.dungeons.selected_dungeon_class),
      classes: dungeonClasses,
      classAverage: Object.values(dungeonClasses).reduce((a, b) => a + b.level, 0) / Object.keys(dungeonClasses).length,
      classAverageWithProgress: Object.values(dungeonClasses).reduce((a, b) => a + b.levelWithProgress, 0) / Object.keys(dungeonClasses).length,
      totalClassExp: Object.values(userProfile.dungeons.player_classes).reduce((a, b) => a + b.experience, 0)
    },
    stats: {
      secrets: getSecrets(userProfile.dungeons),
      highestFloorBeatenNormal: userProfile.dungeons.dungeon_types.catacombs.highest_tier_completed ?? 0,
      highestFloorBeatenMaster: userProfile.dungeons.dungeon_types.master_catacombs.highest_tier_completed ?? 0,
      bloodMobKills: getBestiaryFamily(userProfile, "Undead")?.kills ?? 0
    },
    catacombs: formatCatacombsData(userProfile.dungeons.dungeon_types.catacombs),
    master_catacombs: formatCatacombsData(userProfile.dungeons.dungeon_types.master_catacombs)
  };
}
