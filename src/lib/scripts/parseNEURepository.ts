import type { NEUItem } from "$types/processed/NotEnoughUpdates/NotEnoughUpdates";
import fs from "node:fs";
import { NBTParser } from "./NBTParser";
import { formatBestiaryConstants } from "./NotEnoughUpdates/bestiary";

export const NEU_ITEMS = new Map<string, NEUItem>();
export const NEU_CONSTANTS = new Map();

export async function parseNEURepository() {
  const timeNow = performance.now();
  if (!fs.existsSync("src/lib/constants/NotEnoughUpdates-REPO/items")) {
    throw new Error("Couldn't find the NEU items directory (src/lib/constants/NotEnoughUpdates-REPO/items). Make sure you have the NEU repository cloned in the correct location.");
  }

  const items = fs.readdirSync("src/lib/constants/NotEnoughUpdates-REPO/items");
  for (const item of items) {
    const itemData = JSON.parse(fs.readFileSync(`src/lib/constants/NotEnoughUpdates-REPO/items/${item}`, "utf8"));

    itemData.nbttag = NBTParser.parse(itemData.nbttag);

    NEU_ITEMS.set(itemData.internalname, itemData);
  }

  const constants = fs.readdirSync("src/lib/constants/NotEnoughUpdates-REPO/constants");
  for (const constant of constants) {
    if (constant === "petnums.json") {
      const petNums = JSON.parse(fs.readFileSync(`src/lib/constants/NotEnoughUpdates-REPO/constants/${constant}`, "utf8"));

      NEU_CONSTANTS.set("petnums", petNums);
    } else if (constant === "pets.json") {
      const pets = JSON.parse(fs.readFileSync(`src/lib/constants/NotEnoughUpdates-REPO/constants/${constant}`, "utf8"));

      NEU_CONSTANTS.set("pets", pets);
    } else if (constant === "bestiary.json") {
      const bestiary = JSON.parse(fs.readFileSync(`src/lib/constants/NotEnoughUpdates-REPO/constants/${constant}`, "utf8"));

      const bestiaryData = formatBestiaryConstants(bestiary);

      NEU_CONSTANTS.set("bestiary", bestiaryData);
    }
  }

  console.log(`Parsed ${items.length.toLocaleString()} items in ${(performance.now() - timeNow).toLocaleString()}ms`);
}

parseNEURepository();
