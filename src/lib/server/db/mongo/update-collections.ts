import { building } from "$app/environment";
import type { Collection } from "$lib/server/constants/collections";
import MONGO from "../mongo";

const headers = { Accept: "application/json", "User-Agent": "SkyCrypt" };
const updateInterval = 1000 * 60 * 60 * 12; // 12 hours
const cacheInternal = 10 * 60 * 1000; // 10 minutes

type CollectionResponse = {
  [string: string]: {
    name: string;
    items: Record<string, CollectionItem>;
  };
};

type CollectionItem = {
  name: string;
  maxTiers: number;
  tiers: {
    tier: number;
    amountRequired: number;
    unlocks: string[];
  }[];
};

export async function updateCollections() {
  if (building) return;

  try {
    const timeNow = Date.now();
    const cache = await MONGO.collection("collections").findOne({});

    if (cache && cache.lastUpdated > Date.now() - cacheInternal) {
      console.log(`[COLLECTIONS] Fetched collections in ${(Date.now() - timeNow).toLocaleString()}ms (cached)`);
      return;
    }

    const response = await fetch("https://api.hypixel.net/v2/resources/skyblock/collections", {
      headers: headers
    });
    const data = await response.json();

    const collections = {} as Record<string, Collection>;
    for (const [category, collection] of Object.entries(data.collections as CollectionResponse)) {
      collections[category.toLowerCase()] = {
        name: collection.name,
        items: Object.keys(collection.items).map((id) => {
          return {
            id,
            name: collection.items[id].name,
            texture: `/api/item/${id}`,
            maxTier: collection.items[id].maxTiers,
            tiers: collection.items[id].tiers
          };
        })
      };
    }

    const output = { lastUpdated: Date.now(), collections };

    await MONGO.collection("collections").updateOne({}, { $set: output }, { upsert: true });

    console.log(`[COLLECTIONS] Fetched collections in ${(Date.now() - timeNow).toLocaleString()}ms`);
  } catch (e) {
    console.error(e);
  }

  setTimeout(updateCollections, updateInterval);
}
