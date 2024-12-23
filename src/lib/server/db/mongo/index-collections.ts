import MONGO from "$lib/server/db/mongo";

export async function indexCollectons() {
  await MONGO.collection("emojis").createIndex({ uuid: 1 }, { unique: true });

  console.log("[MONGO] Collections indexed");
}
