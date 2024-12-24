import { building } from "$app/environment";
import MONGO from "$lib/server/db/mongo";

export const CACHED_EMOJIS = new Map<string, string>();
export async function updateCachedEmojis() {
  if (building) return;

  const timeNow = Date.now();
  const emojis = await MONGO.collection("emojis").find().toArray();
  for (const emoji of emojis) {
    CACHED_EMOJIS.set(emoji.uuid, emoji.emoji);
  }

  console.log(`[EMOJIS] Updated emojis in ${Date.now() - timeNow}ms`);
}

setInterval(updateCachedEmojis, 1000 * 60 * 60); // 1 hour
updateCachedEmojis();
