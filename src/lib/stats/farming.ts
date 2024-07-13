import * as constants from "$constants/constants";
import type { Contest, Farming, Medal, Member, Profile } from "$types/global";
import { createFarmingWeightCalculator } from "farming-weight";

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

function getFarmingWeight(profile: Profile, userProfile: Member, formattedMedals: Record<string, number>) {
  const calculator = createFarmingWeightCalculator({
    collection: userProfile.collection,
    farmingXp: userProfile.player_data?.experience?.SKILL_FARMING,
    levelCapUpgrade: userProfile.jacobs_contest?.perks?.farming_level_cap,
    anitaBonusFarmingFortuneLevel: userProfile.jacobs_contest?.perks?.double_drops,
    minions: Object.values(profile.members)
      .map((member) => member.player_data?.crafted_generators ?? [])
      .flat(),
    pests: userProfile.bestiary.kills
  }).setEarnedMedals(formattedMedals);

  const weight = calculator.getWeightInfo();
  const crops = calculator.getCropWeights();

  return {
    totalWeight: weight.totalWeight,
    bonusWeight: weight.bonusWeight,
    cropsWeight: Object.values(crops).reduce((acc, amount) => acc + amount, 0),
    bonusSources: weight.bonusSources,
    crops: Object.entries(crops).map(([crop, amount]) => ({ name: constants.CROPS[crop], id: crop, amount }))
  };
}

export function getFarming(profile: Profile, userProfile: Member) {
  const output = {
    uniqueGolds: (userProfile.jacobs_contest?.unique_brackets?.gold || []).length,
    pelts: userProfile.quests?.trapper_quest?.pelt_count || 0,
    medals: {},
    contests: {}
  } as Farming;

  for (const medal of constants.FARMING_MEDALS) {
    output.medals[`${medal}`] = {
      amount: userProfile.jacobs_contest?.medals_inv?.[medal as Medal] || 0,
      total: 0
    };
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
        texture: `/api/item/${cropId}`,
        collected: Math.max(contestData.collected, output.contests[cropId]?.collected || 0),
        amount: (output.contests[cropId]?.amount || 0) + 1,
        medals: output.contests[cropId]?.medals ?? {
          bronze: 0,
          silver: 0,
          gold: 0,
          platinum: 0,
          diamond: 0
        }
      };

      const medal = contestData.claimed_medal ?? getMedalType(contestData);
      if (medal !== null) {
        output.medals[medal].total += 1;

        output.contests[cropId].medals[medal] += 1;
      }
    }
  }

  output.contestsAttended = Object.values(userProfile.jacobs_contest?.contests ?? {}).filter((contest) => contest.collected > 100).length;

  const formattedMedals = Object.keys(output.medals).reduce((acc, key) => ({ ...acc, [key]: output.medals[key].total }), {} as Record<string, number>);
  output.weight = getFarmingWeight(profile, userProfile, formattedMedals);

  return output;
}
