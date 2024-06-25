import * as constants from "$constants/constants";
import * as helper from "$lib/helper";
import type { AccessoriesOutput, Member } from "$types/global";
import type { Accessories, Accessory, ProcessedItem, SpecialAccessory } from "$types/stats";
import { getStatsFromItems } from "./items/stats";

/**
 * Checks if an accessory is present in an array of accessories.
 *
 * @param {Object[]} accessories - The array of accessories to search.
 * @param {Object|string} accessory - The accessory object or ID to find.
 * @param {Object} [options] - The options object.
 * @param {boolean} [options.ignoreRarity=false] - Whether to ignore the rarity of the accessory when searching.
 * @returns {boolean} True if the accessory is found, false otherwise.
 */
function hasAccessory(accessories: Accessory[], accessory: Accessory | string, options = { ignoreRarity: false }) {
  const id = typeof accessory === "object" ? accessory.id : accessory;

  if (options.ignoreRarity === false) {
    const rarity = typeof accessory === "object" ? accessory.rarity : "";

    return accessories.some((a) => a.id === id && constants.RARITIES.indexOf(a.rarity) >= constants.RARITIES.indexOf(rarity));
  } else {
    return accessories.some((a) => a.id === id);
  }
}

/**
 * Finds an accessory in an array of accessories by its ID.
 *
 * @param {Object[]} accessories - The array of accessories to search.
 * @param {string} accessory - The ID of the accessory to find.
 * @returns {Object|undefined} The accessory object if found, or undefined if not found.
 */
function getAccessory(accessories: Accessory[], accessory: string) {
  return accessories.find((a) => a.id === accessory);
}

function getEnrichments(accessories: ProcessedItem[]) {
  const output = {} as Record<string, number>;
  for (const item of accessories) {
    const specialAccessory = constants.SPECIAL_ACCESSORIES[helper.getId(item)];

    if (constants.RARITIES.indexOf(item.rarity) < constants.RARITIES.indexOf("legendary") || specialAccessory?.allowsEnrichment === false || item.isInactive === true) {
      continue;
    }

    const enrichemnt = (item.tag.ExtraAttributes.talisman_enrichment ?? "missing") as string;
    output[enrichemnt] ??= 0;
    output[enrichemnt] += 1;
  }

  return Object.fromEntries(Object.entries(output).sort(([, a], [, b]) => b - a));
}

function getMissing(items: ProcessedItem[], accessories: Accessory[]) {
  const ACCESSORIES = constants.getAllAccessories() as Accessory[];
  const unique = ACCESSORIES.map(({ id, rarity: rarity }: { id: string; rarity: string }) => ({ id, rarity }));

  for (const { id } of unique) {
    if (id in constants.ACCESSORY_ALIASES === false) continue;

    for (const duplicate of constants.ACCESSORY_ALIASES[id]) {
      if (hasAccessory(accessories, duplicate as unknown as Accessory, { ignoreRarity: true }) === true) {
        const accessory = getAccessory(accessories, duplicate);
        if (accessory) {
          accessory.id = id;
        }
      }
    }
  }
  let missing = unique.filter((accessory) => hasAccessory(accessories, accessory as Accessory) === false);

  for (const { id } of missing) {
    const upgrades = constants.getUpgradeList(id);
    if (upgrades === undefined) {
      continue;
    }

    for (const upgrade of upgrades.filter((item) => upgrades.indexOf(item) > upgrades.indexOf(id))) {
      if (hasAccessory(accessories, upgrade) === true) {
        missing = missing.filter((item) => item.id !== id);
      }
    }
  }

  const upgrades = [];
  const other = [];
  for (const { id, rarity } of missing) {
    const ACCESSORY = ACCESSORIES.find((a: Accessory | SpecialAccessory) => a.id === id && a.rarity === rarity);
    if (ACCESSORY === undefined) {
      continue;
    }

    const object = {
      ...ACCESSORY,
      display_name: ACCESSORY.name ?? null,
      rarity: rarity
    };

    if ((constants.getUpgradeList(id) && constants.getUpgradeList(id)[0] !== id) || (ACCESSORY as SpecialAccessory).rarities) {
      upgrades.push(object);
    } else {
      other.push(object);
    }
  }

  return {
    accessories: items,
    missing: other,
    upgrades: upgrades
  };
}

export async function getMissingAccessories(items: Accessories, userProfile: Member, packs: string[]): Promise<AccessoriesOutput> {
  const accessoryIds = items.accessory_ids as Accessory[];
  if (!accessoryIds || accessoryIds?.length === 0) {
    return {} as AccessoriesOutput;
  }

  const output = getMissing(items.accessories, accessoryIds) as unknown as AccessoriesOutput;
  for (const key in output) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    for (const item of output[key]) {
      let price = 0;

      if (item.customPrice === true) {
        if (item.upgrade) {
          price = (await helper.getItemPrice(item.upgrade.item)) * item.upgrade.cost[item.rarity];
        }

        if (item.id === "POWER_ARTIFACT") {
          for (const { slot_type: slot } of item.gemstone_slots) {
            price += await helper.getItemPrice(`PERFECT_${slot}_GEM`);
          }
        }
      } else {
        price = await helper.getItemPrice(item.id);
      }

      item.extra = { price };
      if (price > 0) {
        helper.addToItemLore(item, `§7Price: §6${Math.round(price).toLocaleString()} Coins §7(§6${helper.formatNumber(Math.floor(price / helper.getMagicalPower(item.rarity, item.id)))} §7per MP)`);
      }

      item.tag ??= {};
      item.tag.ExtraAttributes ??= {};
      item.tag.ExtraAttributes.id ??= item.id;
      item.Damage ??= item.damage;
      // item.id ??= item.item_id;

      helper.applyResourcePack(item, packs);
    }

    (output[key as keyof typeof output] as ProcessedItem[]).sort((a: ProcessedItem, b: ProcessedItem) => {
      const aPrice = a.extra?.price || 0;
      const bPrice = b.extra?.price || 0;

      if (aPrice === 0) return 1;
      if (bPrice === 0) return -1;

      return aPrice - bPrice;
    });
  }

  const accessories = items.accessories;
  const activeAccessories = accessories.filter((a) => a.isInactive === false);

  output.stats = getStatsFromItems(items.accessories);
  output.enrichments = getEnrichments(items.accessories);
  output.unique = activeAccessories.filter((a) => a.isUnique === true).length;
  output.total = constants.UNIQUE_ACCESSORIES_COUNT;

  output.recombobulated = activeAccessories.filter((a) => a.recombobulated === true).length;
  output.totalRecombobulated = constants.RECOMBABLE_ACCESSORIES_COUNT;

  const abiphoneContacts = (userProfile.nether_island_player_data?.abiphone?.active_contacts ?? []).length;
  const riftPrism = accessoryIds.find((a) => a.id === "RIFT_PRISM");
  if (riftPrism) {
    output.unique += 1;
  }

  output.magicalPower = {
    total: 0,
    accessories: activeAccessories.reduce((a, b) => a + helper.getMagicalPower(b.rarity, helper.getId(b)), 0),
    abiphone: abiphoneContacts ? Math.floor(abiphoneContacts / 2) : 0,
    riftPrism: riftPrism ? 11 : 0,
    hegemony: {
      rarity: activeAccessories.find((a) => helper.getId(a) === "HEGEMONY")?.rarity ?? null,
      amount: helper.getMagicalPower(activeAccessories.find((a) => helper.getId(a) === "HEGEMONY")?.rarity ?? "", "HEGEMONY_ARTIFACT")
    },
    rarities: {}
  };

  output.magicalPower.total = Object.keys(output.magicalPower)
    .filter((a) => a !== "hegemony")
    .reduce((a, b) => {
      const value = output.magicalPower[b as keyof typeof output.magicalPower];

      return typeof value === "number" ? a + value : a;
    }, 0);

  for (const rarity in constants.MAGICAL_POWER) {
    const accessories = activeAccessories.filter((a) => a.rarity === rarity);

    output.magicalPower.rarities[rarity] = {
      // accessories: accessories.map((a) => helper.getId(a)),
      amount: accessories.length,
      magicalPower: accessories.reduce((a, b) => a + helper.getMagicalPower(rarity, helper.getId(b)), 0)
    };
  }

  return output;
}
