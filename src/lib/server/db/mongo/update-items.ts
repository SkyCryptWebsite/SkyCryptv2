import { building } from "$app/environment";
import MONGO from "../mongo";

const headers = { Accept: "application/json", "User-Agent": "SkyCrypt" };
const updateInterval = 1000 * 60 * 60 * 12; // 12 hours
const cacheInternal = 10 * 60 * 1000; // 10 minutes

export async function updateItems() {
  if (building) return;

  try {
    const timeNow = Date.now();
    const cache = await MONGO.collection("items").findOne({});
    if (cache && cache.lastUpdated > Date.now() - cacheInternal) {
      console.log(`[ITEMS] Fetched items in ${(Date.now() - timeNow).toLocaleString()}ms (cached)`);
      return;
    }

    const response = await fetch("https://api.slothpixel.me/api/skyblock/items", {
      headers: headers
    });
    const data = await response.json();

    const items = Object.keys(data).map((skyblockId) => {
      const skyblockItem = data[skyblockId];

      const item = {
        skyblock_id: skyblockId,
        id: data.item_id,
        damage: 0,
        tier: "common"
      };

      return Object.assign(item, skyblockItem);
    });

    const output = { lastUpdated: Date.now(), items };

    await MONGO.collection("items").updateOne({}, { $set: output }, { upsert: true });

    console.log(`[ITEMS] Fetched items in ${(Date.now() - timeNow).toLocaleString()}ms`);
  } catch (e) {
    console.error(e);
  }

  setTimeout(updateItems, updateInterval);
}
