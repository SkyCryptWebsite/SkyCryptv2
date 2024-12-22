import { init as resourcesInit } from "$lib/custom_resources";
import { updateCollections } from "$lib/server/constants/update-collections";
import { updateItems } from "$lib/server/constants/update-items";
import { intializeNEURepository, parseNEURepository } from "$lib/server/helper/NotEnoughUpdates/parseNEURepository";
import { updateNotEnoughUpdatesRepository } from "$lib/server/helper/NotEnoughUpdates/updateNEURepository";
import type { ServerInit } from "@sveltejs/kit";
import { getPrices } from "skyhelper-networth";
import { startMongo } from "./lib/server/db/mongo";
import { startRedis } from "./lib/server/db/redis";

export const init: ServerInit = async () => {
  console.log("Starting...");
  resourcesInit();

  startMongo()?.then(() => {
    console.log("[MONGO] MongoDB succeesfully connected");
  });

  startRedis().then(() => {
    console.log("[REDIS] Redis succeesfully connected");
  });

  intializeNEURepository().then(() => {
    updateNotEnoughUpdatesRepository().then(() => {
      parseNEURepository();

      updateItems();
      updateCollections();
    });
  });

  getPrices().then(() => {
    console.log("[NETWORTH] Prices sucessfully fetched!");
  });
};
