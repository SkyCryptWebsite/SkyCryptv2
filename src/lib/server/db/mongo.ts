import { building } from "$app/environment";
import { MONGO_DATABASE, MONGO_HOST, MONGO_PORT } from "$env/static/private";
import { MongoClient, type Db } from "mongodb";
import { updateCollections } from "./mongo/update-collections";
import { updateItems } from "./mongo/update-items";

const client = !building ? new MongoClient(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`) : null;

export function startMongo() {
  if (building) return;
  console.log("[MONGO] Starting mongo...");

  updateItems();
  updateCollections();

  return client?.connect() as Promise<MongoClient>;
}

export default client?.db() as Db;
