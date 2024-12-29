import * as constants from "$lib/server/constants/constants";
import { getBonusStats, STATS_BONUS } from "$lib/shared/constants/stats";
import type { Member, SlayerBoss, SlayerData } from "$types/global";

function getKills(slayer: SlayerBoss) {
  if (slayer === undefined) {
    return {};
  }

  const killKeys = Object.keys(slayer).filter((key) => key.startsWith("boss_kills_tier_"));

  const output = {} as Record<string, number>;
  for (const key of killKeys) {
    const tier = (parseInt(key.split("_").at(-1) as string) + 1).toString();

    output[tier] = slayer[key as keyof typeof slayer] as number;
  }

  output.total = Object.values(output).reduce((acc, kills) => acc + kills, 0);

  return output;
}

function getLevel(slayer: string, data: SlayerBoss) {
  if (constants.SLAYER_XP[slayer] === undefined || data?.xp === undefined) {
    return {
      xp: 0,
      level: 0,
      maxLevel: 0,
      xpCurrent: 0,
      xpForNext: constants.SLAYER_XP[slayer] ? constants.SLAYER_XP[slayer]["1"] : 0,
      maxed: false
    };
  }

  const reversed = Object.entries(constants.SLAYER_XP[slayer]).reverse();

  const maxLevel = Object.keys(constants.SLAYER_XP[slayer]).length;
  for (const [level, xp] of reversed) {
    if (data.xp >= xp) {
      const xpForNext = constants.SLAYER_XP[slayer][parseInt(level) + 1];
      return {
        xp: data.xp,
        xpForNext,
        level: parseInt(level),
        maxLevel,
        maxed: parseInt(level) === maxLevel
      };
    }
  }

  return {
    xp: data.xp,
    xpForNext: 0,
    level: 0,
    maxLevel,
    maxed: false
  };
}

export function getSlayer(userProfile: Member) {
  const slayerData = userProfile.slayer?.slayer_bosses;
  if (slayerData === undefined) {
    return { unlocked: false };
  }

  const output = { data: {} } as SlayerData;
  for (const id of constants.SLAYERS) {
    const data = slayerData[id];
    output.data[id] = {
      name: constants.SLAYER_INFO[id].name,
      texture: constants.SLAYER_INFO[id].head,
      kills: getKills(data),
      level: getLevel(id, data)
    };
  }

  const stats = {} as Record<string, number>;
  for (const id in output.data) {
    const statsBonus = STATS_BONUS[`slayer_${id}`];
    const level = output.data[id].level.level;

    for (const stat in getBonusStats(level, statsBonus)) {
      stats[stat] = (stats[stat] || 0) + getBonusStats(level, statsBonus)[stat];
    }
  }

  output.totalSlayerExp = Object.values(slayerData).reduce((acc, boss) => acc + (boss?.xp ?? 0), 0);
  output.stats = Object.fromEntries(Object.entries(stats).sort(([, a], [, b]) => b - a));

  return output;
}
