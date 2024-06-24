import type { DatabaseItem } from "$types/global";
import { ITEMS } from "$lib/constants/items";
import MONGO from "$lib/server/db/mongo";

export async function updateItems() {
  const items = await MONGO.collection("items").findOne({});
  if (items?.items === undefined) {
    return;
  }

  for (const item of items.items) {
    const skyBlockItem = item as DatabaseItem;
    if (skyBlockItem.skyblock_id === undefined) {
      return;
    }

    ITEMS.set(skyBlockItem.skyblock_id, skyBlockItem);
  }
}

updateItems();
setTimeout(updateItems, 1000 * 60 * 60 * 12); // 12 hours
