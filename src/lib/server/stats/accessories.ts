import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";
import { itemSorter } from "$lib/server/stats/items/processing";
import { getMissingAccessories } from "$lib/server/stats/missing";
import type { Accessories, Accessory, AccessoryRarities, GetItemsItems, Member, ProcessedItem } from "$types/global";

export async function getAccessories(userProfile: Member, items: GetItemsItems, packs: string[]) {
  const { talisman_bag: accessoryBag, inventory, enderchest } = items;
  const storage = items.backpack.map((i) => i.containsItems ?? []).flat();
  const armor = items.armor.armor;

  const output = {
    accessories: [] as ProcessedItem[],
    accessory_ids: [] as Accessory[],
    accessory_rarities: {} as Partial<AccessoryRarities>
  } as Accessories;
  const accessories = [];
  const accessoryIds = [];
  const accessoryRarities = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
    special: 0,
    very_special: 0,
    abicase: { model: "" },
    rift_prism: userProfile.rift?.access?.consumed_prism ? true : false
  } as AccessoryRarities;

  // Add accessories from armor
  for (const accessory of armor.filter((a) => a.categories && a.categories.includes("accessory"))) {
    const id = helper.getId(accessory);
    if (id === "") {
      continue;
    }

    const insertAccessory = Object.assign({ isUnique: true, isInactive: false }, accessory);

    accessories.push(insertAccessory);
    accessoryIds.push({
      id: id,
      rarity: insertAccessory.rarity
    });
  }

  // Add accessories from inventory and accessory bag
  for (const accessory of accessoryBag.concat(inventory.filter((a) => a.categories && a.categories.includes("accessory")))) {
    const id = helper.getId(accessory);
    if (id === "") {
      continue;
    }

    const insertAccessory = Object.assign({ isUnique: true, isInactive: false }, accessory);

    // mark lower tiers as inactive
    if (constants.getUpgradeList(id) !== undefined) {
      accessories.find((a) => {
        if (constants.getUpgradeList(id).includes(helper.getId(a)) === false) {
          return;
        }

        a.isInactive = true;
        a.isUnique = false;
      });
    }

    // mark accessory inactive if player has two exactly same accessories
    accessories.map((a) => {
      if (helper.getId(a) === helper.getId(insertAccessory)) {
        insertAccessory.isInactive = false;
        insertAccessory.isUnique = true;
        a.isInactive = true;
        a.isUnique = false;

        if (constants.RARITIES.indexOf(a.rarity ?? "common") > constants.RARITIES.indexOf(insertAccessory.rarity ?? "common")) {
          a.isInactive = false;
          a.isUnique = true;
          insertAccessory.isUnique = false;
          insertAccessory.isInactive = true;
        }
      }
    });

    // mark accessory aliases as inactive
    const ACCESSORY_ALIASES = constants.ACCESSORY_ALIASES;
    if (id in ACCESSORY_ALIASES || Object.keys(ACCESSORY_ALIASES).find((a) => ACCESSORY_ALIASES[a].includes(id))) {
      let accessoryDuplicates = ACCESSORY_ALIASES[id];
      if (accessoryDuplicates === undefined) {
        const aliases = Object.keys(ACCESSORY_ALIASES).filter((a) => ACCESSORY_ALIASES[a].includes(id));
        accessoryDuplicates = aliases.concat(ACCESSORY_ALIASES[aliases as unknown as string]);
      }

      for (const duplicate of accessoryDuplicates) {
        accessoryBag.concat(inventory.filter((a: ProcessedItem) => a.categories && a.categories.includes("accessory"))).map((a) => {
          if (helper.getId(a) === duplicate) {
            a.isInactive = true;
            a.isUnique = false;
          }
        });
      }
    }

    accessories.push(insertAccessory);
    accessoryIds.push({
      id: id,
      rarity: insertAccessory.rarity
    });

    if (insertAccessory.isInactive === false) {
      accessoryRarities[insertAccessory.rarity as keyof typeof accessoryRarities]++;
      if (id === "ABICASE") {
        accessoryRarities.abicase = { model: insertAccessory.extra?.model ?? "" };
      }
    }
  }

  // Add accessories from enderchest and backpacks
  for (const item of enderchest.concat(storage)) {
    if ("categories" in item === false) {
      continue;
    }

    let items = [item];
    if (item.categories && !item.categories.includes("accessory") && "containsItems" in item && Array.isArray(item.containsItems)) {
      items = item.containsItems.slice(0);
    }

    for (const accessory of items.filter((a) => a.categories && a.categories.includes("accessory"))) {
      const insertAccessory = Object.assign({ isUnique: false, isInactive: true }, accessory);

      accessories.push(insertAccessory);
    }
  }

  for (const accessory of accessories) {
    if (accessory.isUnique === false || accessory.isInactive === true) {
      const source = accessory.extra?.source;
      if (source !== undefined && accessory.tag.display !== undefined) {
        accessory.tag.display.Lore.push("", `§7Location: §c${source}`);
      }
    }
  }

  if (accessoryRarities.rift_prism === true) {
    accessoryIds.push({
      id: "RIFT_PRISM",
      rarity: "rare"
    });
  }

  output.accessories = accessories.sort(itemSorter);
  output.accessory_ids = accessoryIds as Accessory[];
  output.accessory_rarities = accessoryRarities;

  return await getMissingAccessories(output, userProfile, packs);
}
