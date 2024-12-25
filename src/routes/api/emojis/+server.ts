import MONGO from "$lib/server/db/mongo";
import { json } from "@sveltejs/kit";

export async function GET() {
  const savedEmoji = await MONGO.collection("emojis").find().toArray();
  if (savedEmoji === null) {
    return json({ error: "Failed to fetch emojis" }, { status: 500 });
  }

  return json({
    success: true,
    data: savedEmoji
  });
}
