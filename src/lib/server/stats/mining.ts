import * as constants from "$lib/server/constants/constants";
import { getLevelByXp } from "$lib/server/stats/leveling/leveling";
import type { Member } from "$types/global";
import type { Player } from "$types/raw/player/lib";
import { getHotmItems } from "./hotm";
import { stripItems } from "./items/stripping";

/**
 * @param {number} hotmTier
 * @param {number} potmTier
 * @returns {number}
 */
export function calcHotmTokens(hotmTier: number, potmTier: number) {
  let tokens = 0;

  for (let tier = 1; tier <= hotmTier; tier++) {
    tokens += constants.HOTM.rewards.hotm[tier]?.token_of_the_mountain || 0;
  }

  for (let tier = 1; tier <= potmTier; tier++) {
    tokens += (constants.HOTM.rewards.potm[tier]?.token_of_the_mountain || 0) as number;
  }

  return tokens;
}

function getCommissionMilestone(userProfile: Member) {
  if (userProfile.objectives?.tutorial === undefined) {
    return 0;
  }

  return userProfile.objectives.tutorial.reduce((acc, key) => {
    if (key.startsWith("commission_milestone_reward_mining_xp_tier_") === false) {
      return acc;
    }

    const tier = parseInt(key.slice(43));
    return Math.max(acc, tier);
  }, 0);
}

function getCrystalNucleusRunData(userProfile: Member) {
  const output = { crystals: {}, parts: {} } as { crystals: Record<string, string>; parts: Record<string, string> };
  for (const crystal of constants.GEMSTONE_CRYSTALS) {
    output.crystals[crystal] = userProfile.mining_core?.crystals?.[`${crystal}_crystal`]?.state ?? "NOT_FOUND";
  }

  for (const part in constants.PRECURSOR_PARTS) {
    output.parts[part] = userProfile.mining_core?.biomes?.precursor?.parts_delivered?.includes(part) ? "DELIVERED" : "NOT_DELIVERED";
  }

  return output;
}

function getForge(userProfile: Member) {
  const output = [];

  const quickForgeLevel = userProfile.mining_core?.nodes?.forge_time ?? 0;
  const quickForge = quickForgeLevel ? (quickForgeLevel <= 19 ? 100 + quickForgeLevel * 5 : 300) / 10 : 0;

  for (const item of Object.values(userProfile.forge?.forge_processes?.forge_1 ?? {})) {
    output.push({
      id: item.id,
      name: constants.FORGE[item.id].name,
      slot: item.slot,
      startingTime: item.startTime,
      endingTime: item.startTime + constants.FORGE[item.id].duration - constants.FORGE[item.id].duration * (quickForge / 100),
      duration: constants.FORGE[item.id].duration - constants.FORGE[item.id].duration * quickForge
    });
  }

  return output;
}

export function getMining(userProfile: Member, player: Player, packs: string[]) {
  const HOTM = getLevelByXp(userProfile.mining_core?.experience, { type: "hotm" });
  const totalTokens = calcHotmTokens(HOTM.level, userProfile.mining_core?.nodes?.special_0 ?? 0);

  const crystalNucleusRuns = Object.values(userProfile.mining_core?.crystals ?? {})
    .filter((x) => x.total_placed)
    .map((x) => x.total_placed ?? 0);

  const crystalNucleusRunsAmount = crystalNucleusRuns.length ? Math.min(...crystalNucleusRuns) : 0;

  return {
    level: HOTM,
    peak_of_the_mountain: {
      level: userProfile.mining_core?.nodes?.special_0 ?? 0,
      maxLevel: constants.MAX_PEAK_OF_THE_MOUNTAIN_LEVEL
    },
    selectedPickaxeAbility: constants.HOTM.names[userProfile.mining_core?.selected_pickaxe_ability] ?? "None",
    tokens: {
      total: totalTokens,
      spent: userProfile.mining_core?.tokens_spent ?? 0,
      available: totalTokens - (userProfile.mining_core?.tokens_spent ?? 0)
    },
    commissions: {
      milestone: getCommissionMilestone(userProfile),
      completions: player.achievements.skyblock_hard_working_miner || 0
    },
    crystalHollows: {
      crystalHollowsLastAccess: userProfile.mining_core?.greater_mines_last_access,
      nucleusRuns: crystalNucleusRunsAmount,
      progress: getCrystalNucleusRunData(userProfile)
    },
    powder: {
      mithril: {
        spent: userProfile.mining_core?.powder_spent_mithril ?? 0,
        total: userProfile.mining_core?.powder_mithril_total ?? 0,
        available: userProfile.mining_core?.powder_mithril ?? 0
      },
      gemstone: {
        spent: userProfile.mining_core?.powder_spent_gemstone ?? 0,
        total: userProfile.mining_core?.powder_gemstone_total ?? 0,
        available: userProfile.mining_core?.powder_gemstone ?? 0
      },
      glacite: {
        spent: userProfile.mining_core?.powder_spent_glacite ?? 0,
        total: userProfile.mining_core?.powder_glacite_total ?? 0,
        available: userProfile.mining_core?.powder_glacite ?? 0
      }
    },
    forge: getForge(userProfile),
    hotm: stripItems(getHotmItems(userProfile, packs))
  };
}
