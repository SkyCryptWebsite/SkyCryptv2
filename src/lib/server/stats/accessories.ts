import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";

import { itemSorter } from "$lib/server/stats/items/processing";
import { getMissingAccessories } from "$lib/server/stats/missing";
import type { Accessories, Accessory, GetItemsItems, Member } from "$types/global";

export async function getAccessories(userProfile: Member, items: GetItemsItems, packs: string[]) {
  const { talisman_bag: accessoryBag, inventory, enderchest } = items;
  const storage = items.backpack.map((i) => i.containsItems ?? []).flat();
  const armor = items.armor.armor;

  const output = { accessories: [], accessory_ids: [], accessory_rarities: {} } as Accessories;
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
    abicase: { model: "" }
  };

  // Add accessories from accessory bag and armor (Active accessories)
  for (const accessory of accessoryBag.concat(armor.filter((a) => a.categories && a.categories.includes("accessory")))) {
    const id = helper.getId(accessory);
    if (id === "") {
      continue;
    }

    const insertAccessory = Object.assign({ isInactive: false }, accessory);
    if (id === "ABICASE") {
      accessoryRarities.abicase = { model: accessory.tag.ExtraAttributes.model ?? "" };
    }

    accessories.push(insertAccessory);
    accessoryIds.push({ id: id, rarity: insertAccessory.rarity });
  }

  // Add accessories from inventory, enderchest, and storage (Inactive accessories)
  const allAccessories = inventory
    .concat(enderchest, storage)
    .concat(storage.map((i) => i.containsItems ?? []).flat())
    .filter((a) => a.categories && a.categories.includes("accessory"));
  for (const accessory of allAccessories) {
    const insertAccessory = Object.assign({ isInactive: true }, accessory);
    helper.addToItemLore(insertAccessory, ["", "§7Inactive: §cNot in accessory bag "]);
    accessories.push(insertAccessory);
  }

  const activeAccessories = accessories.filter((a) => a.isInactive === false);
  for (const accessory of activeAccessories) {
    const id = helper.getId(accessory);
    const rarity = accessory.rarity ?? "common";

    const duplicates = accessories.filter((a) => helper.getId(a) === id);
    if (duplicates.length > 1) {
      for (const duplicate of duplicates) {
        if (constants.RARITIES.indexOf(duplicate.rarity ?? "common") < constants.RARITIES.indexOf(rarity)) {
          if (duplicate.tag.display.Lore.at(-1)?.includes("§7Inactive: ") === false) {
            helper.addToItemLore(duplicate, ["", `§7Inactive: §cFound a higher rarity accessory`]);
          }

          duplicate.isInactive = true;
          // console.log(`Marking ${helper.getId(duplicate)} ${duplicate.rarity} as inactive because ${id} ${rarity} is active`);
        } else if (duplicate.rarity === rarity) {
          if (duplicate.tag.display.Lore.at(-1)?.includes("§7Inactive:") === false) {
            helper.addToItemLore(duplicate, ["", `§7Inactive: §cFound a duplicate accessory`]);
          }

          duplicate.isInactive = true;
          // console.log(`Marking ${helper.getId(duplicate)} ${duplicate.rarity} and ${id} ${rarity} as inactive`);
        }
      }

      if (duplicates.every((a) => a.isInactive === true)) {
        accessory.isInactive = false;
      }
    }

    const ACCESSORY_ALIASES = constants.ACCESSORY_ALIASES;
    if (id in ACCESSORY_ALIASES || Object.values(ACCESSORY_ALIASES).flat().includes(id)) {
      const alias = Object.keys(ACCESSORY_ALIASES).find((key) => ACCESSORY_ALIASES[key].includes(id));
      if (!alias) {
        continue;
      }

      const aliases = [alias, ACCESSORY_ALIASES[alias]].flat();
      for (const a of accessories) {
        if (aliases.includes(helper.getId(a)) && a !== accessory) {
          if (a.tag.display.Lore.at(-1)?.includes("§7Inactive: §cAlias of") === false) {
            helper.addToItemLore(a, ["", `§7Inactive: §cAlias of ${accessory.display_name}`]);
          }

          a.isInactive = true;
        }
      }

      accessory.isInactive = false;
      accessory.tag.display.Lore.pop();
      accessory.tag.display.Lore.pop();
    }
  }

  for (const accessory of accessories) {
    const id = helper.getId(accessory);
    const ACCESSORY_UPGRADES = constants.getUpgradeList(id);
    if (ACCESSORY_UPGRADES !== undefined) {
      for (const upgrade of ACCESSORY_UPGRADES) {
        if (ACCESSORY_UPGRADES.indexOf(upgrade) < ACCESSORY_UPGRADES.indexOf(id)) {
          const upgradeAccessory = accessories.find((a) => helper.getId(a) === upgrade);
          if (upgradeAccessory !== undefined) {
            upgradeAccessory.isInactive = true;
          }
        }
      }
    }
  }

  for (const accessory of accessories) {
    if (accessory.isUnique === false || accessory.isInactive === true) {
      const source = accessory.extra?.source;
      if (source !== undefined && accessory.tag.display !== undefined) {
        helper.addToItemLore(accessory, ["", `§7Location: §c${helper.titleCase(source)}`]);
      }
    }
  }

  if (userProfile.rift?.access?.consumed_prism === true) {
    accessoryIds.push({ id: "RIFT_PRISM", rarity: "rare" });
  }

  output.accessories = accessories.sort(itemSorter);
  output.accessory_ids = accessoryIds as Accessory[];
  output.accessory_rarities = accessoryRarities;

  return await getMissingAccessories(output, userProfile, packs);
}
