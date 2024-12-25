import { isEnchanted } from "$lib/shared/helper";
import type { ProcessedItem, ProcessedPet, ProcessedSkyBlockItem, ProcessedSkyblockPet } from "$types/stats";

const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

export function stripItem(item: ProcessedItem | ProcessedPet, keys?: string[]): ProcessedSkyBlockItem {
  if (!item.display_name && !(item as ProcessedItem).tag?.display?.Name) {
    return {} as ProcessedSkyBlockItem;
  }

  if ((item as ProcessedPet).lore !== undefined) {
    return stripPetData(item as ProcessedPet) as unknown as ProcessedSkyBlockItem;
  }

  const itemData = item as ProcessedItem;
  const output = {
    display_name: itemData.display_name ?? itemData.tag.display.Name ?? "Unknown",
    lore: itemData.tag?.display?.Lore ?? [],
    texture_path: itemData.texture_path,
    containsItems: itemData.containsItems?.map((item) => stripItem(item, keys))
  } as ProcessedSkyBlockItem;

  if (itemData.Count > 1) {
    output.Count = itemData.Count;
  }

  if (itemData.recombobulated) {
    output.recombobulated = itemData.recombobulated;
  }

  if (itemData.rarity && itemData.rarity !== "common") {
    output.rarity = itemData.rarity;
  }

  if (itemData.shiny || itemData.glowing || isEnchanted(itemData)) {
    output.shiny = true;
  }

  if (keys?.length) {
    for (const key of keys) {
      output[key] = getNestedValue(itemData, key);
    }
  }

  return output;
}

function stripPetData(pet: ProcessedPet): ProcessedSkyblockPet {
  const output = {
    display_name: pet.display_name,
    lore: pet.lore,
    type: pet.type,
    rarity: pet.rarity,
    texture_path: pet.texture_path,
    level: pet.level.level,
    active: pet.active
  } as ProcessedSkyblockPet;

  if (pet.active) {
    output.stats = pet.stats;
  }

  return output;
}

export function stripItems(items: Array<ProcessedItem | ProcessedPet>, keys?: string[]): ProcessedSkyBlockItem[] {
  if (items.length === 0) {
    return [];
  }

  return items.map((item) => stripItem(item, keys ?? []));
}
