import type { Collection } from "$constants/collections";
import MONGO from "../db/mongo";

export const COLLECTIONS = new Map<string, Collection>();

async function updateCollections() {
  const collections = await MONGO.collection("collections").findOne({});
  if (collections?.collections == null) {
    return;
  }

  for (const category in collections.collections) {
    // TODO: Make this more robust
    if (["lastUpdated", "_id"].includes(category)) {
      continue;
    }

    COLLECTIONS.set(category, collections.collections[category] as Collection);
  }
}

updateCollections();
setTimeout(updateCollections, 1000 * 60 * 60 * 12); // 12 hours
