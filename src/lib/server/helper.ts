import type { Item, ProcessedItem } from "$types/stats";
import { getPrices } from "skyhelper-networth";
import { getTexture } from "../custom_resources";
import * as constants from "./constants/constants";

export * from "$lib/server/helper/cache";
export * from "$lib/server/helper/item";
export * from "$lib/shared/helper";

/**
 * Converts an RGB color value to its corresponding hexadecimal representation.
 * @param rgb - The RGB color value in the format "r, g, b".
 * @returns The hexadecimal representation of the RGB color value.
 */
export function rgbToHex(rgb: string) {
  const [r, g, b] = rgb.split(",").map((c) => parseInt(c.trim()));

  return [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

/**
 * Converts a string to a number if it can be converted.
 * @param {string} key
 * @returns {string | number}
 */
function getKey(key: string): string | number {
  const intKey = Number(key);

  if (!isNaN(intKey)) {
    return intKey;
  }

  return key;
}

/**
 * Checks if a path exists on the object.
 * @param {object} obj - An object.
 * @param  {...(string | number)} keys - A path.
 * @returns {boolean} - If the path exists on the object.
 */
export function hasPath<T extends object>(obj: T, ...keys: (string | number)[]): boolean {
  if (obj == null) {
    return false;
  }

  let loc: unknown = obj;

  for (let i = 0; i < keys.length; i++) {
    if (typeof loc === "object" && loc !== null) {
      loc = (loc as Record<string, unknown>)[getKey(keys[i] as string)];
    } else {
      return false;
    }

    if (loc === undefined) {
      return false;
    }
  }

  return true;
}

/**
 * Gets the value at the path on the object.
 * @param {object} obj - An object.
 * @param  {...(string | number)} keys - A path.
 * @returns {any} - The value at the path on the object.
 */
export function getPath<T extends object, K = unknown>(obj: T, ...keys: (string | number)[]): K | undefined {
  if (obj == null) {
    return undefined;
  }

  let loc: unknown = obj;

  for (let i = 0; i < keys.length; i++) {
    if (typeof loc === "object" && loc !== null) {
      loc = (loc as Record<string, unknown>)[getKey(keys[i] as string)];
    } else {
      return undefined;
    }

    if (loc === undefined) {
      return undefined;
    }
  }

  return loc as K;
}

/**
 * Retrieves the ID of a SkyBlock item.
 * @param item The SkyBlock item.
 * @returns The ID of the item, or an empty string if the ID is not found.
 */
export function getId(item: ProcessedItem | Item) {
  return item?.tag?.ExtraAttributes?.id ?? "";
}

export function getTextureValue(item: Item) {
  return item?.tag?.SkullOwner?.Properties?.textures?.at(0)?.Value ?? "";
}

/**
 * Get Minecraft lore without the color and formatting codes
 * @param {string} text lore with color codes
 * @returns {string} lore without color codes
 */
export function getRawLore(text: string) {
  return text.replaceAll(/§[0-9a-fk-or]/g, "");
}

/**
 * @param {string} s
 * @returns {string}
 */
export function titleCase(s: string) {
  if (s.length === 0) {
    return "";
  }

  return s[0].toUpperCase() + s.slice(1);
}

export function rarityNameToInt(string: string) {
  return constants.RARITIES.indexOf(string.toLowerCase());
}

/**
 * Returns the price of the item. Returns 0 if the item is not found or if the item argument is falsy.
 * @param {string} item - The ID of the item to retrieve the price for.
 * @returns {number}
 * @returns {Promise<number>}
 */
export async function getItemPrice(item: string | ProcessedItem) {
  if (!item) return 0;

  const prices = (await getPrices(true)) as Record<string, number>;

  if (typeof item === "string") {
    return prices[item.toLowerCase()] ?? 0;
  }

  return prices[getId(item).toLowerCase()] ?? 0;
}

/**
 * Adds lore to an item's display tag.
 *
 * @param {Item} item - The item to add lore to.
 * @param {string|string[]} lore - The lore to add to the item. If a string is provided, it will be converted to an array.
 * @returns {Item} The modified item.
 */
export function addToItemLore(item: Partial<ProcessedItem>, lore: string | string[]) {
  if (typeof lore === "string") {
    lore = [lore];
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  item.tag ??= {};
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  item.tag.display ??= {};
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  item.tag.display.Lore ??= [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  item.tag.display.Lore = item.tag.display.Lore.concat(lore);

  return item;
}

/**
 * Applies a resource pack to an item, modifying its texture and animation properties if a custom texture is found.
 *
 * @param {Item} item - The item to apply the resource pack to.
 * @param {string[]} packs - The ID or array of IDs of the resource pack(s) to search for the custom texture.
 * @returns {Promise<Item>} A Promise that resolves with the modified item.
 */
export async function applyResourcePack(item: ProcessedItem, packs: string[]) {
  const customTexture = getTexture(item, {
    pack_ids: packs
  });

  if (customTexture) {
    item.texture_path = (customTexture.path ?? "").toString();
  }

  return item;
}

/**
 * Returns the magical power of an item based on its rarity and optional ID.
 * @param {string} rarity - The rarity of the item. See {@link MAGICAL_POWER}.
 * @param {string|null} [id=null] - (Optional) The ID of the item.
 * @returns {number} Returns 0 if `rarity` is undefined or if `rarity` is not a valid rarity value.
 */
export function getMagicalPower(rarity: string, id: string) {
  if (rarity === undefined) return 0;

  if (id !== null && typeof id === "string") {
    // Hegemony artifact provides double MP
    if (id === "HEGEMONY_ARTIFACT") {
      return 2 * (constants.MAGICAL_POWER[rarity] ?? 0);
    }

    // Rift Prism grants 11 MP
    if (id === "RIFT_PRISM") {
      return 11;
    }
  }

  return constants.MAGICAL_POWER[rarity] ?? 0;
}

/**
 * floors a number to a certain number of decimal places
 * @param {number} num the number to be floored
 * @param {number} decimals the number of decimal places to floor to
 * @returns {number} the floored number
 */
export function floor(num: number, decimals = 0) {
  return Math.floor(Math.pow(10, decimals) * num) / Math.pow(10, decimals);
}

/**
 * rounds a number to a certain number of decimal places
 * @param {number} num the number to be rounded
 * @param {number} decimals the number of decimal places to round to
 * @returns {number} the rounded number
 */
export function round(num: number, decimals = 0) {
  return Math.round(Math.pow(10, decimals) * num) / Math.pow(10, decimals);
}

/**
 * ceils a number to a certain number of decimal places
 * @param {number} num the number to be ceiled
 * @param {number} decimals the number of decimal places to ceil to
 * @returns {number} the ceiled number
 */
export function ceil(num: number, decimals = 0) {
  return Math.ceil(Math.pow(10, decimals) * num) / Math.pow(10, decimals);
}

export function romanize(num: number) {
  const lookup = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  } as Record<string, number>;
  let roman = "";

  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

export function generateUUID() {
  let u = "",
    i = 0;
  while (i++ < 36) {
    const c = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"[i - 1],
      r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    u += c == "-" || c == "4" ? c : v.toString(16);
  }
  return u;
}

export function generateItem(data: Partial<ProcessedItem>) {
  if (!data) {
    return {} as ProcessedItem;
  }

  const DEFAULT_DATA = {
    id: 389,
    Damage: 0,
    Count: 1,
    display_name: "",
    rarity: null,
    categories: [],
    type: "misc",
    tag: {
      display: {
        Name: "",
        Lore: [""]
      }
    }
  };

  // Making sure rarity is lowercase
  if (data.rarity) {
    data.rarity = data.rarity.toLowerCase();
  }

  if (data.name && (data.display_name === undefined || data.display_name?.length === 0)) {
    data.display_name = data.name;
  }

  if (!data.rarity && data.tier) {
    data.rarity = data.tier.toLowerCase();
  }

  if (data.item_id) {
    data.id = data.item_id;
  }

  // Setting tag.display.Name using display_name if not specified
  if (data.display_name && !data.tag?.display?.Name) {
    data.tag ??= {} as ProcessedItem["tag"];
    data.tag.display ??= {} as ProcessedItem["tag"]["display"];

    const rarityColor = data.rarity ? `§${constants.RARITY_COLORS[data.rarity ?? "common"]}` : "";
    data.tag.display.Name = `${rarityColor}${data.display_name}`;
  }

  return Object.assign(DEFAULT_DATA, data) as ProcessedItem;
}

export function getHeadTextureUUID(value: string) {
  const json = JSON.parse(Buffer.from(value, "base64").toString());
  const url = json.textures.SKIN.url;
  const uuid = url.split("/").pop();

  return uuid;
}

import { STATS_DATA } from "$lib/shared/constants/stats";
import { removeFormatting } from "$lib/shared/helper";
import type { ItemStats } from "$types/processed/profile/stats";

/**
 * Gets the stats from an item
 * @param  {Item} piece
 * @returns {ItemStats}
 */
export function getStatsFromItem(piece: Item): ItemStats {
  const regex = /^([A-Za-z ]+): ([+-]([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{0,2})?))/;
  const stats = {} as ItemStats;

  if (!piece) {
    return stats;
  }

  const lore = (piece.tag.display?.Lore || []).map((line) => removeFormatting(line));

  for (const line of lore) {
    const match = regex.exec(line);

    if (match == null) {
      continue;
    }

    const statName = Object.keys(STATS_DATA).find((key) => STATS_DATA[key].nameLore === match[1]);
    const statValue = parseFloat(match[2].replace(/,/g, ""));

    if (statName) {
      stats[statName] = (stats[statName] || 0) + statValue;
    }
  }

  return stats;
}

/**
 * Capitalizes the first letter of a string
 * @param {string} string
 * @returns {string}
 * @deprecated Use CSS text-transform: capitalize; (capitalize in Tailwind CSS) instead.
 * @DO_NOT_USE
 */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Returns a formatted progress bar string based on the given amount and total.
 *
 * @param {number} amount - The current amount.
 * @param {number} total - The total amount.
 * @param {string} [color="a"] - The color of the progress bar.
 * @returns {string} The formatted progress bar string.
 */
export function formatProgressBar(amount: number, total: number, completedColor = "a", missingColor = "f") {
  const barLength = 25;
  const progress = Math.min(1, amount / total);
  const progressBars = Math.floor(progress * barLength);
  const emptyBars = barLength - progressBars;

  return `${`§${completedColor}§l§m-`.repeat(progressBars)}${`§${missingColor}§l§m-`.repeat(emptyBars)}§r`;
}
