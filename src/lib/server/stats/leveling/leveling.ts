import * as constants from "$lib/server/constants/skills";
import type { Member, Profile } from "$types/global";
import type { Player } from "$types/raw/player/lib";
import type { Extra } from "$types/stats";

/**
 * gets the xp table for the given type
 * @param {string} type
 * @returns {{[key: number]: number}}
 */
function getXpTable(type: string): { [key: number]: number } {
  switch (type) {
    case "runecrafting":
      return constants.RUNECRAFTING_XP;
    case "social":
      return constants.SOCIAL_XP;
    case "dungeoneering":
      return constants.DUNGEONEERING_XP;
    case "hotm":
      return constants.HOTM_XP;
    case "skyblock_level":
      return constants.SKYBLOCK_XP;
    default:
      return constants.LEVELING_XP;
  }
}

/**
 * Gets the level and some other information from an xp amount.
 * @param {number} xp The experience points to calculate level information from.
 * @param {Object} [extra={}] Additional options for level calculation.
 * @param {string} [extra.type] The ID of the skill (used to determine xp table and default cap).
 * @param {string} [extra.texture] The ID of the texture to use for the skill.
 * @param {number} [extra.cap] Override for the highest level the player can reach.
 */
export function getLevelByXp(
  xp: number,
  extra: Extra = {
    type: "default"
  }
) {
  const xpTable = getXpTable(extra.type);
  if (typeof xp !== "number" || isNaN(xp)) {
    xp = 0;
  }

  /** the level that this player is caped at */
  const levelCap = extra.cap ?? constants.DEFAULT_SKILL_CAPS[extra.type] ?? Math.max(...Object.keys(xpTable).map(Number));

  /** the level ignoring the cap and using only the table */
  let uncappedLevel = 0;

  /** the amount of xp over the amount required for the level (used for calculation progress to next level) */
  let xpCurrent = xp;

  /** like xpCurrent but ignores cap */
  let xpRemaining = xp;

  while (xpTable[uncappedLevel + 1] <= xpRemaining) {
    uncappedLevel++;
    xpRemaining -= xpTable[uncappedLevel];
    if (uncappedLevel <= levelCap) {
      xpCurrent = xpRemaining;
    }
  }

  /** Whether the skill has infinite leveling (dungeoneering and skyblock level) */
  const isInfiniteLevelable = constants.INFINITE.includes(extra.type);

  /** adds support for infinite leveling (dungeoneering and skyblock level) */
  if (isInfiniteLevelable) {
    const maxExperience = Object.values(xpTable).at(-1) as number;

    uncappedLevel += Math.floor(xpRemaining / maxExperience);
    xpRemaining %= maxExperience;
    xpCurrent = xpRemaining;
  }

  /** the maximum level that any player can achieve (used for gold progress bars) */
  const maxLevel = isInfiniteLevelable ? Math.max(uncappedLevel, levelCap) : (constants.MAXED_SKILL_CAPS[extra.type] ?? levelCap);

  /** the level as displayed by in game UI */
  const level = isInfiniteLevelable ? uncappedLevel : Math.min(levelCap, uncappedLevel);

  /** the amount amount of xp needed to reach the next level (used for calculation progress to next level) */
  const xpForNext = (level < maxLevel ? Math.ceil(xpTable[level + 1] ?? Object.values(xpTable).at(-1)) : isInfiniteLevelable ? Object.values(xpTable).at(-1) : Infinity) as number;

  /** the fraction of the way toward the next level */
  const progress = level >= maxLevel && !isInfiniteLevelable ? 0 : Math.max(0, Math.min(xpCurrent / xpForNext, 1));

  /** a floating point value representing the current level for example if you are half way to level 5 it would be 4.5 */
  const levelWithProgress = isInfiniteLevelable ? uncappedLevel + progress : Math.min(uncappedLevel + progress, levelCap);

  /** a floating point value representing the current level ignoring the in-game unlockable caps for example if you are half way to level 5 it would be 4.5 */
  const unlockableLevelWithProgress = extra.cap ? Math.min(uncappedLevel + progress, maxLevel) : levelWithProgress;

  /** the amount of xp needed to max out the skill */
  // const maxExperience = getSkillExperience(extra.type, levelCap);

  /** whether the skill is maxed or not */
  const maxed = level >= maxLevel;

  return {
    xp,
    level,
    maxLevel,
    xpCurrent,
    xpForNext,
    progress,
    levelCap,
    uncappedLevel,
    levelWithProgress,
    unlockableLevelWithProgress,
    // ? NOTE: Temporarily mark this as false until we implement leaderboards
    maxed: extra.type === "skyblock_level" ? false : maxed,
    texture: constants.SKILL_ICONS[extra.texture ?? extra.type]
    // maxExperience
  };
}

/**
 * Calculates the skill level caps for different skills based on the profile data and Hypixel player data.
 * @param {Object} userProfile The profile data containing information about the player's skills.
 * @param {Object} hypixelPlayer The Hypixel player data containing information about the player's achievements.
 * @returns {Object} An object containing the skill level caps for farming, taming, and runecrafting.
 */
export function getSkillLevelCaps(userProfile: Member, player: Player) {
  return {
    farming: 50 + (userProfile.jacobs_contest?.perks?.farming_level_cap || 0),
    taming: Math.min(Math.max(player.achievements?.skyblock_domesticator || 50, 50), 60),
    runecrafting: player.newPackageRank ? 25 : 3
  };
}

/**
 * Calculates the total social skill experience for a given profile.
 * @param {Object} profile The profile object containing skill data.
 * @returns {number} The total social skill experience.
 */
export function getSocialSkillExperience(profile: Profile): number {
  return Object.keys(profile.members).reduce((acc, member) => {
    return acc + (profile.members[member]?.player_data?.experience?.SKILL_SOCIAL || 0);
  }, 0);
}

export function getXpByLevel(
  level: number,
  extra: Extra = {
    type: "default"
  }
) {
  // does same as getLevelByXp but it uses level instead of xp
  const xpTable = getXpTable(extra.type);
  if (typeof level !== "number" || isNaN(level)) {
    level = 0;
  }

  /** the level that this player is caped at */
  const levelCap = extra.cap ?? constants.DEFAULT_SKILL_CAPS[extra.type] ?? Math.max(...Object.keys(xpTable).map(Number));

  /** the level ignoring the cap and using only the table */
  let uncappedLevel = 0;

  /** the amount of xp over the amount required for the level (used for calculation progress to next level) */
  let xpCurrent = 0;

  /** like xpCurrent but ignores cap */
  let xpRemaining = 0;

  for (let i = 0; i < level; i++) {
    uncappedLevel++;
    xpRemaining += xpTable[uncappedLevel];
    if (uncappedLevel <= levelCap) {
      xpCurrent = xpRemaining;
    }
  }

  /** Whether the skill has infinite leveling (dungeoneering and skyblock level) */
  const isInfiniteLevelable = constants.INFINITE.includes(extra.type);

  /** adds support for infinite leveling (dungeoneering and skyblock level) */
  if (isInfiniteLevelable) {
    const maxExperience = Object.values(xpTable).at(-1) as number;

    uncappedLevel += Math.floor(xpRemaining / maxExperience);
    xpRemaining %= maxExperience;
    xpCurrent = xpRemaining;
  }

  /** the maximum level that any player can achieve (used for gold progress bars) */
  const maxLevel = isInfiniteLevelable ? Math.max(uncappedLevel, levelCap) : (constants.MAXED_SKILL_CAPS[extra.type] ?? levelCap);

  /** the amount amount of xp needed to reach the next level (used for calculation progress to next level) */
  const xpForNext = (level < maxLevel ? Math.ceil(xpTable[level + 1] ?? Object.values(xpTable).at(-1)) : isInfiniteLevelable ? Object.values(xpTable).at(-1) : Infinity) as number;

  /** the fraction of the way toward the next level */
  const progress = level >= maxLevel && !isInfiniteLevelable ? 0 : Math.max(0, Math.min(xpCurrent / xpForNext, 1));

  /** a floating point value representing the current level for example if you are half way to level 5 it would be 4.5 */
  const levelWithProgress = isInfiniteLevelable ? uncappedLevel + progress : Math.min(uncappedLevel + progress, levelCap);

  /** a floating point value representing the current level ignoring the in-game unlockable caps for example if you are half way to level 5 it would be 4.5 */
  const unlockableLevelWithProgress = extra.cap ? Math.min(uncappedLevel + progress, maxLevel) : levelWithProgress;

  /** the amount of xp needed to max out the skill */
  // const maxExperience = getSkillExperience(extra.type, levelCap);

  /** whether the skill is maxed or not */
  const maxed = level >= maxLevel;

  return {
    xp: xpCurrent,
    level,
    maxLevel,
    xpCurrent,
    xpForNext,
    progress,
    levelCap,
    uncappedLevel,
    levelWithProgress,
    unlockableLevelWithProgress,
    maxed,
    texture: constants.SKILL_ICONS[extra.texture ?? extra.type]
    // maxExperience
  };
}
