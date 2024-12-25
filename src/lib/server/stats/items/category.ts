import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";
import { itemSorter } from "$lib/server/stats/items/processing";
import type { ProcessedItem } from "$types/stats";
import { stripItem, stripItems } from "./stripping";

export function getCategory(allItems: ProcessedItem[], category: string) {
  const output = allItems.filter((a) => a && a.categories?.includes(category));

  for (const item of allItems.filter((a) => a)) {
    if (!Array.isArray(item.containsItems)) {
      continue;
    }

    output.push(...getCategory(item.containsItems, category));
  }

  return output.sort(itemSorter);
}

export function getWeapons(allItems: ProcessedItem[]) {
  const weapons = getCategory(allItems, "weapon");

  const countsOfId: { [key: string]: number } = {};
  for (const weapon of weapons) {
    const id = helper.getId(weapon);

    countsOfId[id] = (countsOfId[id] || 0) + 1;

    if (weapon.rarity && countsOfId[id] > 2 && constants.RARITIES.indexOf(weapon.rarity) < constants.RARITIES.indexOf("legendary")) {
      weapon.hidden = true;
    }
  }

  const highestPriorityWeapon = getCategory(allItems, "sword")[0];

  return {
    weapons: weapons,
    highest_priority_weapon: stripItem(highestPriorityWeapon)
  };
}
export function getSkilllTools(skill: string, allItems: ProcessedItem[]) {
  const tools = getCategory(allItems, `${skill}_tool`);

  const highestPriorityTool = getCategory(allItems, `${skill}_tool`)[0];

  return {
    tools: stripItems(tools),
    highest_priority_tool: stripItem(highestPriorityTool)
  };
}

export function getPets(allItems: ProcessedItem[]) {
  const output = allItems
    .filter((a: ProcessedItem) => a && a.tag?.ExtraAttributes?.petInfo)
    .map((a: ProcessedItem) => ({
      uuid: a.tag.ExtraAttributes.uuid,
      type: a.tag.ExtraAttributes.petInfo.type,
      exp: a.tag.ExtraAttributes.petInfo.exp,
      active: a.tag.ExtraAttributes.petInfo.active,
      tier: a.tag.ExtraAttributes.petInfo.tier,
      heldItem: a.tag.ExtraAttributes.petInfo.heldItem || null,
      candyUsed: a.tag.ExtraAttributes.petInfo.candyUsed,
      skin: a.tag.ExtraAttributes.petInfo.skin || null
    }));

  for (const item of allItems.filter((a) => a)) {
    if (!Array.isArray(item.containsItems)) {
      continue;
    }

    output.push(
      ...item.containsItems
        .filter((a) => a.tag?.ExtraAttributes?.petInfo !== undefined)
        .map((a: ProcessedItem) => ({
          uuid: a.tag.ExtraAttributes.uuid,
          type: a.tag.ExtraAttributes.petInfo.type,
          exp: a.tag.ExtraAttributes.petInfo.exp,
          active: a.tag.ExtraAttributes.petInfo.active,
          tier: a.tag.ExtraAttributes.petInfo.tier,
          heldItem: a.tag.ExtraAttributes.petInfo.heldItem || null,
          candyUsed: a.tag.ExtraAttributes.petInfo.candyUsed,
          skin: a.tag.ExtraAttributes.petInfo.skin || null
        }))
    );
  }

  return output;
}
