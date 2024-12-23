import { updateCachedEmojis } from "$constants/emojis";
import MONGO from "$lib/server/db/mongo";
import { isEmoji } from "$params/emoji.js";
import { isUUID } from "$params/uuid.js";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
  const data = await request.json();
  if (isUUID(data.uuid) === false) {
    return json({ error: "Invalid UUID" }, { status: 400 });
  }

  if (isEmoji(data.emoji) === false) {
    return json({ error: "Invalid emoji" }, { status: 400 });
  }

  try {
    await MONGO.collection("emojis").updateOne({ uuid: data.uuid }, { $set: { emoji: data.emoji } }, { upsert: true });

    const timeNow = performance.now();
    const savedEmoji = await MONGO.collection("emojis").findOne({ uuid: data.uuid });
    await updateCachedEmojis();
    const timeTaken = performance.now() - timeNow;
    if (savedEmoji === null) {
      return json({ error: "Failed to save emoji" }, { status: 500 });
    }

    return json({
      success: true,
      timeTaken: timeTaken,
      data: savedEmoji
    });
  } catch (error) {
    console.error(error);
    return json({ error }, { status: 500 });
  }
}
