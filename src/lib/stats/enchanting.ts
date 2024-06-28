import * as constants from "$constants/constants";
import type { Member } from "$types/global";

function formatGameData(gameData: Member["experimentation"]["simon"]) {
  const output = [];

  for (const [index, value] of Object.entries(constants.EXPERIMENTS.tiers)) {
    if (!gameData[`attempts_${index}`] && !gameData[`claims_${index}`] && !gameData[`best_score_${index}`]) {
      continue;
    }

    output.push({
      ...value,
      attempts: gameData[`attempts_${index}`],
      claims: gameData[`claims_${index}`],
      bestScore: gameData[`best_score_${index}`]
    });
  }

  return output;
}

export function getEnchanting(userProfile: Member) {
  if (userProfile.experimentation === undefined) {
    return null;
  }

  const output = {} as Record<string, { name: string; stats: { lastAttempt: number; lastClaimed: number; bonusClicks: number; games: ReturnType<typeof formatGameData> } }>;
  for (const key in constants.EXPERIMENTS.games) {
    const gameData = userProfile.experimentation[key];

    output[key] = {
      name: (constants.EXPERIMENTS.games[key as keyof typeof constants.EXPERIMENTS.games] as { name: string }).name,
      stats: {
        lastAttempt: gameData.last_attempt,
        lastClaimed: gameData.last_claimed,
        bonusClicks: gameData.bonus_clicks,
        games: formatGameData(gameData)
      }
    };
  }

  return output;
}
