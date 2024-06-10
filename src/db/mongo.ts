import { MONGO_DATABASE, MONGO_HOST, MONGO_PORT } from "$env/static/private";
import { updateCollections } from "./mongo/update-collections";
import { updateItems } from "./mongo/update-items";
import { MongoClient } from "mongodb";

const client = new MongoClient(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`);

export function startMongo() {
  console.log("[MONGO] Starting mongo...");

  updateItems();
  updateCollections();

  return client.connect();
}

export default client.db();
