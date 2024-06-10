import type { Contest, Farming, Medal, Member } from "$types/global";
import { getLevelByXp } from "./leveling/leveling";
import * as constants from "$constants/constants";
import * as helper from "$lib/helper";

function getMedalType(contest: Contest) {
  const position = contest.claimed_position;
  const participants = contest.claimed_participants;
  if (participants === undefined || position === undefined) {
    return null;
  }

  if (position <= Math.floor(participants * 0.02)) {
    return "diamond";
  } else if (position <= Math.floor(participants * 0.05)) {
    return "platinum";
  } else if (position <= Math.floor(participants * 0.1)) {
    return "gold";
  } else if (position <= Math.floor(participants * 0.3)) {
    return "silver";
  } else if (position <= Math.floor(participants * 0.6)) {
    return "bronze";
  }

  return null;
}

export function getFarming(userProfile: Member) {
  const output = {
    farming: getLevelByXp(userProfile.player_data?.experience?.SKILL_FARMING ?? 0),
    uniqueGolds: (userProfile.jacobs_contest?.unique_brackets?.gold || []).length,
    pelts: userProfile.quests?.trapper_quest?.pelt_count || 0,
    medals: {},
    contests: {}
  } as Farming;

  for (const medal of constants.FARMING_MEDALS) {
    output.medals[`${medal}Medals`] = userProfile.jacobs_contest?.medals_inv?.[medal as Medal] || 0;
    output.medals[`total${helper.titleCase(medal)}Medals`] = 0;
  }

  if (userProfile.jacobs_contest?.contests !== undefined) {
    for (const [contestId, contestData] of Object.entries(userProfile.jacobs_contest.contests)) {
      const isValid = contestData.collected > 100;
      if (isValid === false) {
        continue;
      }

      const cropId = contestId.split(":").slice(2).join(":");
      output.contests[cropId] = {
        name: constants.CROPS[cropId],
        collected: Math.max(contestData.collected, output.contests[cropId]?.collected || 0),
        amount: (output.contests[cropId]?.amount || 0) + 1
      };

      const medal = contestData.claimed_medal ?? getMedalType(contestData);
      if (medal !== null) {
        output.medals[`total${helper.titleCase(medal)}Medals`] += 1;
      }
    }
  }

  return output;
}
