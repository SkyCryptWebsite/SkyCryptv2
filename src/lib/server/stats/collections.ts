import * as constants from "$lib/server/constants/constants";
import { COLLECTIONS } from "$lib/server/constants/update-collections";
import { getUsername } from "$lib/server/lib";
import type { CategoryItem, Collections, Member, Profile } from "$types/global";
import { getKuudraCompletions } from "./crimson_isle";
import { getFloorCompletions } from "./dungeons";

function getBossCollections(userProfile: Member) {
  const bossCollections = [];

  const dungeons = getFloorCompletions(userProfile.dungeons ?? {});
  for (const [floor, amount] of Object.entries(dungeons.total)) {
    if (floor === "total") {
      continue;
    }

    const index = parseInt(floor) - 1;
    bossCollections.push({
      name: constants.BOSS_COLLECTIONS[index].name,
      id: floor,
      texture: constants.BOSS_COLLECTIONS[index].texture,
      amount: amount,
      tier: constants.BOSS_COLLECTIONS[index].collections.filter((t) => t <= amount).length,
      maxTier: constants.BOSS_COLLECTIONS[index].collections.length,
      amounts: [
        {
          username: "Normal",
          amount: dungeons.normal[floor]
        },
        {
          username: "Master Mode",
          amount: dungeons.master[floor]
        }
      ]
    });
  }

  const kuudraCompletions = getKuudraCompletions(userProfile);
  const kuudraCollection = constants.BOSS_COLLECTIONS.find((c) => c.name === "Kuudra");
  if (kuudraCollection) {
    bossCollections.push({
      name: kuudraCollection.name,
      id: "kuudra",
      texture: kuudraCollection.texture,
      amount: kuudraCompletions,
      totalAmount: kuudraCompletions,
      tier: kuudraCollection.collections.filter((t) => t <= kuudraCompletions).length,
      maxTier: kuudraCollection.collections.length
    });
  }

  return {
    name: "Boss",
    texture: "/api/item/SKULL_ITEM:1",
    items: bossCollections as unknown as CategoryItem[],
    totalTiers: bossCollections.length,
    maxTiers: bossCollections.filter((a) => a.tier === a.maxTier).length
  };
}

export async function getCollections(userProfile: Member, profile: Profile) {
  const output = { categories: {} } as Collections;

  const cachedUsernames = {} as Record<string, string>;
  for (const member in profile.members) {
    if (!cachedUsernames[member]) {
      cachedUsernames[member] = await getUsername(member, { cache: true });
    }
  }

  for (const [category, categoryData] of COLLECTIONS) {
    output.categories[category] = {
      name: categoryData.name,
      texture: "/api/item/" + constants.COLLECTION_ICONS[category],
      items: [],
      totalTiers: 0,
      maxTiers: 0
    };

    for (const collection of categoryData.items) {
      const { id, name, maxTier, texture } = collection;

      const amount = (userProfile.collection && userProfile.collection[id]) ?? 0;

      const amounts = [] as { username: string; amount: number }[];
      for (const member in profile.members) {
        amounts.push({
          username: cachedUsernames[member],
          amount: (profile.members[member].collection && profile.members[member].collection[id]) ?? 0
        });
      }

      const totalAmount = amounts.reduce((a, b) => a + b.amount, 0);
      const tier = collection.tiers.findLast((a) => a.amountRequired <= totalAmount)?.tier ?? 0;
      output.categories[category].items.push({
        name,
        id,
        texture,
        amount,
        totalAmount,
        tier,
        maxTier: maxTier,
        amounts
      });

      output.categories[category].totalTiers = output.categories[category].items.length;
      output.categories[category].maxTiers = output.categories[category].items.filter((a) => a.tier === a.maxTier).length;
    }

    output.categories[category].totalTiers = output.categories[category].items.length;

    output.categories[category].maxTiers = output.categories[category].items.filter((a) => a.tier === a.maxTier).length;
  }

  output.categories.boss = getBossCollections(userProfile);

  output.totalCollections = Object.values(output.categories).reduce((a, b) => a + b.items.length, 0);
  output.maxedCollections = Object.values(output.categories)
    .map((a) => a.items)
    .flat()
    .filter((a) => a && a.tier === a.maxTier).length;

  return output;
}
