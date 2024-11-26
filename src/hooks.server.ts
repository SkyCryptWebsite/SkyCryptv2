import { init } from "$lib/custom_resources";
import { updateCollections } from "$lib/server/constants/update-collections";
import { updateItems } from "$lib/server/constants/update-items";
import { parseNEURepository } from "$lib/server/helper/NotEnoughUpdates/parseNEURepository";
import { updateNotEnoughUpdatesRepository } from "$lib/server/helper/NotEnoughUpdates/updateNEURepository";
import { getPrices } from "skyhelper-networth";
import { startMongo } from "./lib/server/db/mongo";
import { startRedis } from "./lib/server/db/redis";

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
