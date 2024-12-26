/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getTexture } from "$lib/server/custom_resources";

import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";

import type { StatsData } from "$types/processed/profile/stats";
import type { GemTier, Gemstone, Item, ProcessedItem } from "$types/stats";

import { STATS_DATA } from "$lib/shared/constants/stats";
import { getItemNetworth } from "skyhelper-networth";
import { addLevelableEnchantmentsToLore } from "./helper";

export function itemSorter(a: ProcessedItem, b: ProcessedItem) {
  if (a.rarity && b.rarity && a.rarity !== b.rarity) {
    return constants.RARITIES.indexOf(b.rarity) - constants.RARITIES.indexOf(a.rarity);
  }

  return a.display_name.localeCompare(b.display_name);
}

const RARITY_PATTERN = new RegExp(`^(?<recomb>a )?(?<shiny>SHINY )?(?:(?<rarity>${constants.RARITIES.map((x) => x.replaceAll("_", " ").toUpperCase()).join("|")}) ?)(?<dungeon>DUNGEON )?(?<type>[A-Z ]+)?(?<recomb2>a)?$`);
export function parseItemTypeFromLore(lore: string[], item: Item) {
  let match = null;
  for (const line of lore.reverse()) {
    match = RARITY_PATTERN.exec(line);

    if (match) {
      break;
    }
  }

  if (match == null) {
    return {
      categories: [],
      rarity: null,
      recombobulated: null,
      dungeon: null,
      shiny: null
    };
  }

  const r = match.groups as {
    rarity: string;
    type: string;
    recomb: string;
    recomb2: string;
    dungeon: string;
    shiny: string;
  };
  return {
    categories: r.type ? getCategories(r.type.trim().toLowerCase(), item) : [],
    rarity: r.rarity.replaceAll(" ", "_").toLowerCase(),
    recombobulated: !!r.recomb && !!r.recomb2,
    dungeon: !!r.dungeon,
    shiny: !!r.shiny
  };
}

function getCategories(type: string, item: Item) {
  const categories = [] as string[];

  const enchantments = item.tag.ExtraAttributes.enchantments || {};
  Object.keys(enchantments).forEach((enchantment) => Object.entries(constants.ENCHANTMENTS_TO_CATEGORIES).forEach(([category, enchantmentList]) => enchantmentList.includes(enchantment) && categories.push(category)));

  return [...new Set(categories.concat(constants.TYPE_TO_CATEGORIES[type as keyof typeof constants.TYPE_TO_CATEGORIES]))];
}

/**
 * @typedef {{slot_type:string,slot_number:number,gem_type:string,gem_tier:string,lore:string}} Gem
 */

/**
 * @param  {{[key:string]:string}} gems item.ExtraAttributes.gems
 * @param  {string} [rarity] item rarity, ex: MYTHIC
 *
 * @returns {object} array of gem objects
 */
export function parseItemGems(gems: { [key: string]: string }, rarity: string) {
  const slots = {
    normal: Object.keys(constants.GEMSTONES),
    special: ["UNIVERSAL", "COMBAT", "OFFENSIVE", "DEFENSIVE", "MINING", "CHISEL"],
    ignore: ["unlocked_slots"]
  };

  const parsed = [] as Gemstone[];
  for (const [key, value] of Object.entries(gems)) {
    const slotType = key.split("_")[0];

    if (slots.ignore.includes(key) || (slots.special.includes(slotType) && key.endsWith("_gem"))) {
      continue;
    }

    if (slots.special.includes(slotType)) {
      parsed.push({
        slot_type: slotType,
        slot_number: +key.split("_")[1],
        gem_type: gems[`${key}_gem`],
        gem_tier: (value as unknown as GemTier)?.quality || value,
        lore: ""
      });
    } else if (slots.normal.includes(slotType)) {
      parsed.push({
        slot_type: slotType,
        slot_number: +key.split("_")[1],
        gem_type: key.split("_")[0],
        gem_tier: (value as unknown as GemTier)?.quality || value,
        lore: ""
      });
    } else {
      console.log(`Error! Unknown gemstone slot key: ${key}`);
      // throw new Error(`Error! Unknown gemstone slot key: ${key}`);
    }
  }

  parsed.forEach((gem) => {
    gem.lore = generateGemLore(gem.gem_type, gem.gem_tier.toString(), rarity);
  });

  return parsed;
}

/**
 * @param  {string} type gem name, ex: RUBY
 * @param  {string} tier gem tier, ex: PERFECT
 * @param  {string} [rarity] item rarity, ex: MYTHIC
 *
 * @returns {string} formatted gem string
 *
 * @example
 * // returns "§cPerfect Ruby §7(§c+25❤§7)"
 * generateGemLore("RUBY", "PERFECT", "MYTHIC");
 */
export function generateGemLore(type: string, tier: string, rarity: string): string {
  const lore = [];
  const stats = [] as string[];

  const gemstoneData = constants.GEMSTONES[type.toUpperCase() as keyof typeof constants.GEMSTONES];
  if (!gemstoneData) {
    return "§c§oMISSING GEMSTONE DATA§r";
  }

  // Gem color
  const color = `§${gemstoneData.color}`;

  // Gem stats
  if (rarity) {
    const gemstoneStats = gemstoneData.stats?.[tier.toUpperCase() as keyof typeof gemstoneData.stats];
    if (gemstoneStats) {
      Object.keys(gemstoneStats).forEach((stat) => {
        let statValue = gemstoneStats[stat as keyof typeof gemstoneStats][helper.rarityNameToInt(rarity)];

        // Fallback since skyblock devs didn't code all gemstone stats for divine rarity yet
        // ...they didn't expect people to own divine tier items other than divan's drill
        if (rarity.toUpperCase() === "DIVINE" && statValue === null) {
          statValue = gemstoneStats[stat as keyof typeof gemstoneStats][helper.rarityNameToInt("MYTHIC")];
        }

        if (statValue) {
          const statsData = STATS_DATA[stat as keyof typeof STATS_DATA] as unknown as StatsData;

          stats.push(["§", statsData.color, "+", statValue, " ", statsData.symbol].join(""));
        } else {
          stats.push("§c§oMISSING VALUE§r");
        }
      });
    }
  }

  // Final lore
  lore.push(color, helper.titleCase(tier), " ", helper.titleCase(type));

  if (stats.length) {
    lore.push("§7 (", stats.join("§7, "), "§7)");
  }

  return lore.join("");
}

// Process items returned by API
export async function processItems(items: ProcessedItem[], source: string, customTextures = false, packs: string[]): Promise<ProcessedItem[]> {
  for (const item of items) {
    if (!item.tag?.ExtraAttributes?.id) {
      continue;
    }

    // POTIONS
    if (item.id == 373) {
      const color = constants.POTION_COLORS[item.Damage % 16];
      const type = item.Damage & 16384 ? "splash" : "normal";

      item.texture_path = `/api/potion/${type}/${color}`;
    }

    item.extra = { source };

    if (item.tag.ExtraAttributes.id === "ENCHANTED_BOOK") {
      item.texture_path = `/api/item/ENCHANTED_BOOK`;
    } else if (customTextures) {
      const customTexture = getTexture(item, { pack_ids: packs, hotm: source === "storage_icons" });

      // ? NOTE: we're ignoring Vanilla leather armor because it's render using /leather/ endpoint (Coloring support)
      const ignoreCustomTexture = customTexture && customTexture.path && customTexture.path.includes("/Vanilla/") && customTexture.path.includes("leather_");
      if (customTexture?.path && ignoreCustomTexture === false) {
        // CUSTOM TEXTURES
        item.texture_path = customTexture.path;
      } else if (item.tag?.SkullOwner?.Properties?.textures?.length > 0) {
        // PLAYER SKULLS
        try {
          const json = JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value, "base64").toString());
          const url = json.textures.SKIN.url;
          const uuid = url.split("/").pop();

          item.texture_path = `/api/head/${uuid}?v6`;
        } catch (e) {
          helper.addToItemLore(item, ["", "§cError: Missing texture"]);
          item.texture_path = `/api/item/BARRIER`;
          console.error(e);
        }
      } else if (typeof item.id === "number" && item.id >= 298 && item.id <= 301) {
        // COLORED LEATHER ARMOR
        const color = (item.tag?.display?.color as unknown as number)?.toString(16).padStart(6, "0") ?? "955e3b";
        const type = ["helmet", "chestplate", "leggings", "boots"][item.id - 298];

        item.texture_path = `/api/leather/${type}/${color}`;
      } else if (!item.texture_path) {
        helper.addToItemLore(item, ["", "§cError: Missing texture"]);
        item.texture_path = `/api/item/BARRIER`;
      }
    }

    if (item.tag?.display?.Name != undefined) {
      item.display_name = helper.getRawLore(item.tag.display.Name);
    }

    // Lore stuff
    const itemLore = item?.tag?.display?.Lore ?? [];
    const loreRaw = [...itemLore];
    const lore = loreRaw != null ? loreRaw.map((a) => (a = helper.getRawLore(a))) : [];

    item.rarity = null;
    item.categories = [];
    if (lore.length > 0) {
      // item categories, rarity, recombobulated, dungeon, shiny
      const itemType = parseItemTypeFromLore(lore, item);

      for (const key in itemType) {
        // @ts-expect-error
        item[key] = itemType[key as keyof typeof itemType];
      }

      // Fix custom maps texture, happens when player is inside of Dungeons
      if (item.id == 358) {
        item.id = 395;
        item.Damage = 0;
      }
    }

    // Set HTML lore to be displayed on the website
    if (itemLore.length > 0) {
      if (item.tag.ExtraAttributes.rarity_upgrades) {
        itemLore.push("§8(Recombobulated)");
      }

      if (item.tag.ExtraAttributes.timestamp) {
        itemLore.push("", `§7Obtained: §c${helper.formatTimestamp(item.tag.ExtraAttributes.timestamp)}`);
      }

      if (item.tag?.display?.color) {
        const hex = item.tag.display.color.toString().padStart(6, "0");
        itemLore.push("", `§7Color: #${hex.toUpperCase()}`);
      }

      if (Object.keys(constants.ENCHANTMENT_LADDERS).some((e) => item.tag.ExtraAttributes[e as keyof typeof item.tag.ExtraAttributes])) {
        for (const [key, constant] of Object.entries(constants.ENCHANTMENT_LADDERS)) {
          const id = key as keyof typeof item.tag.ExtraAttributes;
          if (!item.tag.ExtraAttributes[id]) {
            continue;
          }

          addLevelableEnchantmentsToLore(item.tag.ExtraAttributes[id] as number, constant, itemLore);
        }
      }
    }

    if (item?.tag || item?.exp) {
      if (source.startsWith("storage_icons") === false) {
        try {
          const ITEM_PRICE = await getItemNetworth(item, { cache: true });
          if (ITEM_PRICE?.price > 0) {
            itemLore.push("", `§7Item Value: §6${Math.round(ITEM_PRICE.price).toLocaleString()} Coins §7(§6${helper.formatNumber(ITEM_PRICE.price)}§7)`);
          }
        } catch (error) {
          console.log(error);
          itemLore.push("", `§7Item Value: §cAn error occurred while calculating the value of this item.`);
        }
      } else if (item.containsItems && item.containsItems.length > 0) {
        const filteredItems = item.containsItems.filter((item) => item.tag || item.exp);
        const itemNetworthPromises = filteredItems.map((item) => getItemNetworth(item, { cache: true })).concat(getItemNetworth(item));
        const itemNetworth = await Promise.all(itemNetworthPromises);

        const totalValue = itemNetworth.reduce((acc, cur) => acc + cur.price, 0);
        itemLore.push("", `§7Total Value: §6${Math.round(totalValue).toLocaleString()} Coins §7(§6${helper.formatNumber(totalValue)}§7)`);
      }
    }
  }

  return items;
}
