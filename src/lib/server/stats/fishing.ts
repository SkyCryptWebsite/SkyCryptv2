import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";
import type { Member } from "$types/global";
import type { TrophyFish } from "$types/stats";

function getTrophyFishProgress(userProfile: Member) {
  if (userProfile.trophy_fish === undefined) {
    return null;
  }

  const output = [];
  for (const tier of constants.TROPHY_FISH_TIERS) {
    output.push({
      tier: tier,
      caught: Object.keys(userProfile.trophy_fish).filter((key) => key.endsWith(`_${tier}`)).length,
      total: 18
    });
  }

  return output;
}

function getTrophyFish(userProfile: Member) {
  if (userProfile.trophy_fish === undefined) {
    return null;
  }

  const reverstedTiers = JSON.parse(JSON.stringify(constants.TROPHY_FISH_TIERS)).reverse();

  const output = [];
  for (const [id, data] of Object.entries(constants.TROPHY_FISH)) {
    const trophyFish = {
      id: id,
      name: data.display_name,
      description: data.description
    } as Record<string, string | number | boolean>;

    for (const tier of constants.TROPHY_FISH_TIERS) {
      trophyFish[tier] = userProfile.trophy_fish[`${id.toLowerCase()}_${tier}`] ?? 0;
    }

    const highestTier = constants.TROPHY_FISH_TIERS.find((tier) => userProfile.trophy_fish && userProfile.trophy_fish[`${id.toLowerCase()}_${tier}`] > 0) ?? "bronze";

    trophyFish.texture = data.textures[highestTier];
    trophyFish.maxed = highestTier === reverstedTiers.at(-1);

    output.push(trophyFish);
  }

  return {
    totalCaught: userProfile.trophy_fish.total_caught ?? 0,
    stage: {
      name: constants.TROPHY_FISH_STAGES[Math.min(userProfile.trophy_fish.rewards?.length ?? 0, constants.TROPHY_FISH_STAGES.length) - 1] ?? "Bronze Hunter",
      progress: getTrophyFishProgress(userProfile)
    },
    trophyFish: output as TrophyFish[]
  };
}

export function getFishing(userProfile: Member) {
  const kills = [] as { id: string; name: string; texture: string; amount: number }[];
  for (const mob of constants.SEA_CREATURES) {
    kills.push({
      id: mob,
      name: constants.MOB_NAMES[mob] ?? mob.split("_").map(helper.titleCase).join(" "),
      texture: `/img/sea_creatures/${mob}.png`,
      amount: userProfile.player_stats?.kills?.[mob] ?? 0
    });
  }

  return {
    itemsFished: userProfile.player_stats?.items_fished?.total ?? 0,
    treasure: userProfile.player_stats?.items_fished?.treasure ?? 0,
    treasureLarge: userProfile.player_stats?.items_fished?.large_treasure ?? 0,
    seaCreaturesFished: userProfile.player_stats?.pets?.milestone?.sea_creatures_killed ?? 0,
    shredderFished: userProfile.player_stats?.shredder_rod?.fished ?? 0,
    shredderBait: userProfile.player_stats?.shredder_rod?.bait ?? 0,
    kills: kills,
    trophyFish: getTrophyFish(userProfile)
  };
}
