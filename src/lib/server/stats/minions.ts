import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";
import type { Profile } from "$types/global";
import type { MinionCategory, MinionCategoryType, Minions } from "$types/processed/profile/minions";

function getMinionSlots(profile: Profile, tiers: number) {
  const minionSlots = Object.keys(constants.MINION_SLOTS).map((s) => parseInt(s)) as number[];
  const highestSlots = minionSlots.findLastIndex((slots) => tiers >= slots);

  return {
    bonusSlots: profile.community_upgrades?.upgrade_states?.filter((u) => u.upgrade === "minion_slots").length ?? 0,
    current: constants.MINION_SLOTS[minionSlots[highestSlots]],
    next: minionSlots[highestSlots + 1] - tiers
  };
}

export function getMinions(profile: Profile) {
  const craftedMinions = Object.keys(profile.members)
    .map((uuid) => {
      return profile.members[uuid].player_data?.crafted_generators ?? [];
    })
    .flat();

  const output = { minions: {} } as Minions;
  for (const category in constants.MINIONS) {
    output.minions[category as MinionCategoryType] = {
      minions: [],
      texture: constants.CATEGORY_ICONS[category as MinionCategoryType],
      totalMinions: 0,
      maxedMinions: 0,
      totalTiers: 0,
      maxedTiers: 0
    };

    for (const minion in constants.MINIONS[category]) {
      const minionData = constants.MINIONS[category][minion];

      output.minions[category as MinionCategoryType].minions.push({
        name: minionData.name ?? minion.toLowerCase().split("_").map(helper.titleCase).join(" "),
        texture: minionData.texture,
        maxTier: minionData.maxTier ?? 11,
        tiers: craftedMinions
          .filter((m) => m.split("_").slice(0, -1).join("_") === minion)
          .map((m) => parseInt(m.split("_").at(-1) as string))
          .sort((a, b) => a - b)
      });
    }

    Object.assign(output.minions[category as MinionCategoryType], {
      totalMinions: Object.keys(constants.MINIONS[category]).length,
      maxedMinions: output.minions[category as MinionCategoryType].minions.filter((m) => m.tiers.length === m.maxTier).length,
      totalTiers: Object.values(constants.MINIONS[category]).reduce((acc, m) => acc + (m.maxTier ?? 11), 0),
      maxedTiers: output.minions[category as MinionCategoryType].minions.reduce((acc, m) => acc + m.tiers.length, 0)
    });
  }

  const allMinions = Object.values(output.minions).filter((c): c is MinionCategory => typeof c !== "number");
  Object.assign(output, {
    totalMinions: allMinions.reduce((acc, c) => acc + c.totalMinions, 0),
    maxedMinions: allMinions.reduce((acc, c) => acc + c.maxedMinions, 0),
    totalTiers: allMinions.reduce((acc, c) => acc + c.totalTiers, 0),
    maxedTiers: allMinions.reduce((acc, c) => acc + c.maxedTiers, 0),
    minionsSlots: getMinionSlots(
      profile,
      allMinions.reduce((acc, c) => acc + c.maxedTiers, 0)
    )
  });

  return output;
}
