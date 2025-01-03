import { updateCollections } from "$constants/update-collections";
import { updateItems } from "$constants/update-items";
import { init as resourcesInit } from "$lib/server/custom_resources";
import { indexCollectons } from "$lib/server/db/mongo/index-collections";
import { intializeNEURepository, parseNEURepository } from "$lib/server/helper/NotEnoughUpdates/parseNEURepository";
import type { ServerInit } from "@sveltejs/kit";
import { getPrices } from "skyhelper-networth";
import { startMongo } from "./lib/server/db/mongo";
import { startRedis } from "./lib/server/db/redis";

export const init: ServerInit = async () => {
  console.log("[SkyCrypt] Starting...");
  await resourcesInit();

  await startMongo()?.then(() => {
    console.log("[MONGO] MongoDB succeesfully connected");

    updateItems();
    updateCollections();

    indexCollectons();
  });

  await startRedis().then(() => {
    console.log("[REDIS] Redis succeesfully connected");
  });

  await intializeNEURepository().then(async () => {
    parseNEURepository();
  });

  await getPrices().then(() => {
    console.log("[NETWORTH] Prices sucessfully fetched!");
  });

  console.log("[SkyCrypt] Started!");
};
