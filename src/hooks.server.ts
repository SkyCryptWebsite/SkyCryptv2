import { startMongo } from "./lib/server/db/mongo";
import { startRedis } from "./lib/server/db/redis";
import { init } from "$lib/custom_resources";
import { parseNEURepository } from "$lib/scripts/parseNEURepository";
import { updateNotEnoughUpdatesRepository } from "$lib/scripts/updateNEURepository";
import { getPrices } from "skyhelper-networth";
import { updateItems } from "$lib/server/constants/update-items";
import { updateCollections } from "$lib/server/constants/update-collections";

init();

startMongo().then(() => {
  console.log("[MONGO] Mongo started!");
});

startRedis().then(() => {
  console.log("[REDIS] Redis started!");
});

updateNotEnoughUpdatesRepository().then(() => {
  parseNEURepository();
});

getPrices().then(() => {
  console.log("[NETWORTH] Prices sucessfully fetched!");
});

updateItems();
updateCollections();
