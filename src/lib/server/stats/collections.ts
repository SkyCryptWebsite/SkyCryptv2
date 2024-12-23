import * as constants from "$lib/server/constants/constants";
import { COLLECTIONS } from "$lib/server/constants/update-collections";
import { getUsername } from "$lib/server/lib";
import type { Collections, Member, Profile } from "$types/global";

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

  output.totalCollections = Object.values(output.categories).reduce((a, b) => a + b.items.length, 0);

  output.maxedCollections = Object.values(output.categories)
    .map((a) => a.items)
    .flat()
    .filter((a) => a && a.tier === a.maxTier).length;

  return output;
}
