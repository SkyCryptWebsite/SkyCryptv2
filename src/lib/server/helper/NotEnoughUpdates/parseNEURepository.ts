import { building } from "$app/environment";
import type { NEUItem } from "$types/processed/NotEnoughUpdates/NotEnoughUpdates";
import fs from "node:fs";
import { NBTParser } from "./NBTParser";
import { formatBestiaryConstants } from "./parsers/bestiary";

export const NEU_ITEMS = new Map<string, NEUItem>();
export const NEU_CONSTANTS = new Map();

export async function parseNEURepository() {
  if (building) return;

  const timeNow = performance.now();
  const itemsPath = "src/lib/server/constants/NotEnoughUpdates-REPO/items";

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

  const constants = fs.readdirSync("src/lib/server/constants/NotEnoughUpdates-REPO/constants");
  for (const constant of constants) {
    if (constant === "petnums.json") {
      const petNums = JSON.parse(fs.readFileSync(`src/lib/server/constants/NotEnoughUpdates-REPO/constants/${constant}`, "utf8"));

      NEU_CONSTANTS.set("petnums", petNums);
    } else if (constant === "pets.json") {
      const pets = JSON.parse(fs.readFileSync(`src/lib/server/constants/NotEnoughUpdates-REPO/constants/${constant}`, "utf8"));

      NEU_CONSTANTS.set("pets", pets);
    } else if (constant === "bestiary.json") {
      const bestiary = JSON.parse(fs.readFileSync(`src/lib/server/constants/NotEnoughUpdates-REPO/constants/${constant}`, "utf8"));

      const bestiaryData = formatBestiaryConstants(bestiary);

      NEU_CONSTANTS.set("bestiary", bestiaryData);
    }
  }

  console.log(`[NOT-ENOUGH-UPDATES] Parsed ${items.length.toLocaleString()} items in ${(performance.now() - timeNow).toLocaleString()}ms`);
}

parseNEURepository();
