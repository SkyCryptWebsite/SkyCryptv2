import { MUSEUM, MUSEUM_INVENTORY } from "$constants/museum";
import * as helper from "$lib/server/helper";
import { titleCase } from "$lib/shared/helper";
import type { DecodedMuseumItems, MuseumItems, ProcessedItem } from "$types/global";
import type { MuseumItem } from "$types/raw/museum/lib";

function markChildrenAsDonated(children: string, output: MuseumItems, decodedMuseum: DecodedMuseumItems) {
  output[children] = {
    // if item data exists in decodedMuseum, use it, otherwise mark it as donated as child
    ...(decodedMuseum.items[children] ? decodedMuseum.items[children] : { donated_as_child: true }),
    id: children
  };

  const childOfChild = MUSEUM.children[children];
  if (childOfChild !== undefined) {
    markChildrenAsDonated(childOfChild, output, decodedMuseum);
  }
}

function processMuseumItems(decodedMuseum: DecodedMuseumItems) {
  const output = {} as MuseumItems;
  for (const item of MUSEUM.getAllItems()) {
    const itemData = decodedMuseum.items?.[item];
    if (itemData === undefined && output[item] === undefined) {
      output[item] = {
        missing: true,
        id: item
      };
      continue;
    }

    const children = MUSEUM.children[item];
    if (children !== undefined) {
      markChildrenAsDonated(item, output, decodedMuseum);
    }

    if (itemData !== undefined) {
      output[item] = {
        ...itemData,
        id: item
      };
    }
  }

  const getCategoryItems = (category: keyof typeof MUSEUM) => Object.keys(output).filter((i) => (MUSEUM[category] as string[]).includes(i));
  const getMissingItems = (category: keyof typeof MUSEUM) => getCategoryItems(category).filter((i) => output[i].missing === true);
  const getMaxMissingItems = (category: keyof typeof MUSEUM) => getMissingItems(category).filter((i) => Object.values(MUSEUM.children).includes(i) === false);

  const weapons = getCategoryItems("weapons");
  const armor = getCategoryItems("armor");
  const rarities = getCategoryItems("rarities");

  return {
    value: decodedMuseum.value ?? 0,
    appraisal: false,
    total: {
      amount: Object.keys(output).filter((i) => !output[i].missing).length,
      total: Object.keys(output).length
    },
    weapons: {
      amount: weapons.filter((i) => !output[i].missing).length,
      total: weapons.length
    },
    armor: {
      amount: armor.filter((i) => !output[i].missing).length,
      total: armor.length
    },
    rarities: {
      amount: rarities.filter((i) => !output[i].missing).length,
      total: rarities.length
    },
    special: {
      amount: decodedMuseum.special?.length ?? 0
    },
    items: output,
    specialItems: decodedMuseum.special ?? [],
    missing: {
      main: ["weapons", "armor", "rarities"].map((c) => getMissingItems(c as keyof typeof MUSEUM)).flat(),
      max: ["weapons", "armor", "rarities"].map((c) => getMaxMissingItems(c as keyof typeof MUSEUM)).flat()
    }
  };
}

function formatMuseumItemProgress(
  presetItem: ProcessedItem & {
    progressType: string;
    inventoryType: string;
  },
  museum: MuseumItems
) {
  if (presetItem.progressType === undefined) {
    return presetItem;
  }

  if (presetItem.progressType === "appraisal") {
    const { appraisal, value } = museum;

    helper.addToItemLore(presetItem, [`§7Museum Appraisal Unlocked: ${appraisal ? "§aYes" : "§cNo"}`, "", `§7Museum Value: §6${Math.floor(value).toLocaleString()} Coins §7(§6${helper.formatNumber(value)}§7)`]);
    return presetItem;
  }

  if (presetItem.progressType === "special") {
    const { amount } = museum[presetItem.progressType];
    helper.addToItemLore(presetItem, [`§7Items Donated: §b${amount}`, "", "§eClick to view!"]);
    return presetItem;
  }

  const { amount, total } = museum[presetItem.progressType];
  helper.addToItemLore(presetItem, [`§7Items Donated: §e${Math.floor((amount / total) * 100)}§6%`, `§9§l${helper.formatProgressBar(amount, total, "9")} §b${amount} §9/ §b${total}`, "", "§eClick to view!"]);

  return presetItem;
}

export function getMuseumItems(decodedMuseumItems: DecodedMuseumItems) {
  const museumData = processMuseumItems(decodedMuseumItems);

  const output = [];
  for (let i = 0; i < 6 * 9; i++) {
    output.push(helper.generateItem({ id: undefined }));
  }

  for (const item of MUSEUM_INVENTORY.inventory) {
    const itemSlot = formatMuseumItemProgress(JSON.parse(JSON.stringify(item)), museumData) as MuseumItem;

    const inventoryType = item.inventoryType as keyof typeof museumData;
    if (inventoryType === undefined) {
      if (itemSlot && itemSlot.display_name) {
        output[item.position] = itemSlot;
      }

      continue;
    }

    const museumItems = typeof museumData[inventoryType] === "object" && "total" in museumData[inventoryType] ? museumData[inventoryType].total : typeof museumData[inventoryType] === "object" && "amount" in museumData[inventoryType] ? museumData[inventoryType].amount : undefined;
    const pages = Math.ceil(museumItems / MUSEUM_INVENTORY.item_slots.length);

    for (let page = 0; page < pages; page++) {
      // FRAME
      for (let i = 0; i < 6 * 9; i++) {
        if (itemSlot.containsItems[i]) {
          const presetItem = JSON.parse(JSON.stringify(itemSlot.containsItems[i]));
          const formattedItem = formatMuseumItemProgress(presetItem, museumData);
          if (formattedItem === undefined) {
            continue;
          }

          itemSlot.containsItems[i + page * 54] = formattedItem;
        }

        itemSlot.containsItems[i + page * 54] ??= helper.generateItem({ id: undefined });
      }

      // CLEAR FIRST 4 ITEMS
      for (let i = 0; i < 4; i++) {
        itemSlot.containsItems[i + page * 54] = helper.generateItem({ id: undefined });
      }

      // CATEGORIES
      for (const [index, slot] of Object.entries(MUSEUM_INVENTORY.item_slots)) {
        const slotIndex = parseInt(index) + page * MUSEUM_INVENTORY.item_slots.length;

        // SPECIAL ITEMS CATEGORY
        if (inventoryType === "special") {
          const museumItem = museumData.specialItems[slotIndex];
          if (museumItem === undefined) {
            continue;
          }

          const itemData = museumItem.items[0];

          itemSlot.containsItems[slot + page * 54] = helper.generateItem(itemData);
          continue;
        }

        // WEAPONS, ARMOR & RARITIES
        const itemId = MUSEUM[inventoryType as "weapons" | "armor" | "rarities"][slotIndex];
        if (itemId === undefined) {
          continue;
        }

        const museumItem = museumData.items[itemId];
        // MISSING ITEM
        if (museumItem === undefined || museumItem.missing) {
          const itemData = JSON.parse(JSON.stringify(MUSEUM_INVENTORY.missing_item[inventoryType as "weapons" | "armor" | "rarities"]));
          itemData.display_name = helper.titleCase(MUSEUM.armor_to_id[itemId] ?? itemId);

          itemSlot.containsItems[slot + page * 54] = helper.generateItem(itemData);
          continue;
        }

        // DONATED HIGHER TIER
        if (museumItem.donated_as_child) {
          const itemData = JSON.parse(JSON.stringify(MUSEUM_INVENTORY.higher_tier_donated));
          itemData.display_name = titleCase(MUSEUM.armor_to_id[itemId] ?? itemId);

          itemSlot.containsItems[slot + page * 54] = helper.generateItem(itemData);
          continue;
        }

        // NORMAL ITEM
        const itemData = museumItem.items[0];
        if (museumItem.items.length > 1) {
          itemData.containsItems = museumItem.items.map((i: ProcessedItem) => helper.generateItem(i));
        }

        itemSlot.containsItems[slot + page * 54] = helper.generateItem(itemData);
      }
    }

    output[item.position] = itemSlot;
  }

  return {
    museumItems: museumData,
    inventory: output
  };
}
