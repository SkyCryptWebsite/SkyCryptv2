import * as constants from "$lib/server/constants/constants";
import type { Member } from "$types/global";
import type { Enchanting } from "$types/processed/profile/enchanting";

function getTier(tierValue: number, game: string) {
  return game === "numbers" ? tierValue + 2 : game === "simon" ? Math.min(tierValue + 1, 5) : tierValue;
}

function formatGameData(gameData: Member["experimentation"]["simon"], key: string) {
  const output = [];
  for (const index in constants.EXPERIMENTS.tiers) {
    if (!gameData[`attempts_${index}`] && !gameData[`claims_${index}`] && !gameData[`best_score_${index}`]) {
      continue;
    }

    const tier = getTier(parseInt(index), key);
    output.push({
      ...constants.EXPERIMENTS.tiers[tier],
      attempts: gameData[`attempts_${index}`],
      claims: gameData[`claims_${index}`],
      bestScore: gameData[`best_score_${index}`]
    });
  }

  return output;
}

export function getEnchanting(userProfile: Member) {
  if (userProfile.experimentation === undefined) {
    return { unlocked: false };
  }

  const output = { data: {} } as Enchanting;
  for (const key in constants.EXPERIMENTS.games) {
    const gameData = userProfile.experimentation[key];

    output.data[key] = {
      name: constants.EXPERIMENTS.games[key].name,
      stats: {
        lastAttempt: gameData.last_attempt,
        lastClaimed: gameData.last_claimed,
        bonusClicks: gameData.bonus_clicks,
        games: formatGameData(gameData, key)
      }
    };
  }

  return output;
}
