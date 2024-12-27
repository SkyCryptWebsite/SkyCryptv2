import { building, dev } from "$app/environment";
import type { NEUItem } from "$types/processed/NotEnoughUpdates/NotEnoughUpdates";
import fs from "node:fs";
import simpleGit from "simple-git";
import { NBTParser } from "./NBTParser";
import { formatBestiaryConstants } from "./parsers/bestiary";
import { updateNotEnoughUpdatesRepository } from "./updateNEURepository";

export const NEU_ITEMS = new Map<string, NEUItem>();
export const NEU_CONSTANTS = new Map();

export async function intializeNEURepository() {
  if (building) return;

  if (!fs.existsSync("NotEnoughUpdates-REPO")) {
    fs.mkdirSync("NotEnoughUpdates-REPO", { recursive: true });
  }

  if (dev) {
    console.log(`[NOT-ENOUGH-UPDATES] Initializing NEU repository.`);
    try {
      await simpleGit().submoduleUpdate(["--init", "--recursive"]);
    } catch (error) {
      console.error("Error initializing repository:", error);
    }
  }

  if (!dev || !fs.existsSync("NotEnoughUpdates-REPO/.git")) {
    console.log(`[NOT-ENOUGH-UPDATES] Cloning NEU repository.`);
    await simpleGit().clone("https://github.com/NotEnoughUpdates/NotEnoughUpdates-REPO", "NotEnoughUpdates-REPO");
  }
}

export async function parseNEURepository() {
  if (building) return;

  await updateNotEnoughUpdatesRepository();

  const timeNow = performance.now();
  const itemsPath = "NotEnoughUpdates-REPO/items";

  if (!fs.existsSync(itemsPath)) {
    throw new Error(`Couldn't find the NEU items directory (${itemsPath}). Make sure you have the NEU repository cloned in the correct location.`);
  }

  const items = fs.readdirSync(itemsPath);
  for (const item of items) {
    const itemPath = `${itemsPath}/${item}`;
    if (!fs.statSync(itemPath).isFile()) {
      continue;
    }

    try {
      const itemData = JSON.parse(fs.readFileSync(itemPath, "utf8"));
      itemData.nbttag = NBTParser.parse(itemData.nbttag);
      NEU_ITEMS.set(itemData.internalname, itemData);
    } catch (error) {
      console.error(`Error processing item ${item}:`, error);
    }
  }

  const constants = fs.readdirSync("NotEnoughUpdates-REPO/constants");
  for (const constant of constants) {
    if (constant === "petnums.json") {
      const petNums = JSON.parse(fs.readFileSync(`NotEnoughUpdates-REPO/constants/${constant}`, "utf8"));

      NEU_CONSTANTS.set("petnums", petNums);
    } else if (constant === "pets.json") {
      const pets = JSON.parse(fs.readFileSync(`NotEnoughUpdates-REPO/constants/${constant}`, "utf8"));

      NEU_CONSTANTS.set("pets", pets);
    } else if (constant === "bestiary.json") {
      const bestiary = JSON.parse(fs.readFileSync(`NotEnoughUpdates-REPO/constants/${constant}`, "utf8"));

      const bestiaryData = formatBestiaryConstants(bestiary);

      NEU_CONSTANTS.set("bestiary", bestiaryData);
    }
  }

  console.log(`[NOT-ENOUGH-UPDATES] Parsed ${items.length.toLocaleString()} items in ${(performance.now() - timeNow).toLocaleString()}ms`);
}
