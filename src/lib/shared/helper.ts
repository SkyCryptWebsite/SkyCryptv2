import { MAX_ENCHANTS } from "$lib/shared/constants/enchantments";
import { RARITY_COLORS } from "$lib/shared/constants/items";
import type { ProcessedItem } from "$types/global";
import prettyMilliseconds from "pretty-ms";
export { prettyMilliseconds as formatTime };

/**
 * Formats a number using the compact notation (e.g., 1.2K, 3.4M).
 *
 * @param n - The number to format.
 * @param digits - The number of decimal places to include (default is 2).
 * @returns The formatted number as a string.
 */
export function formatNumber(n: number, digits = 2) {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
    .format(n)
    .replace(/\.0+([A-Za-z])?$/, "$1");
}

/**
 * Converts a string to title case
 * @param {string} string
 * @returns {string}
 */
export function titleCase(string: string): string {
  return string
    .replaceAll(" ", "_")
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns the tailwind css color class for a rarity
 * @param {string} rarity the rarity of the item
 * @param {"bg" | "text"} type the type of color to get
 * @returns {string} the tailwind css color class
 */
export function getRarityClass(rarity: string, type: "bg" | "text"): string {
  const rarityColor = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS];
  // minecraft colors are safelisted in the tailwind config, so they are always generated
  return rarityColor ? `${type}-minecraft-${rarityColor}` : "";
}

/**
 * Checks if a character is a color code
 * @param {string} code
 * @returns {code is ColorCode}
 */
function isColorCode(code: string): code is ColorCode {
  return /[0-9a-f]/.test(code);
}

/**
 * Checks if a character is a format code
 * @param {string} code
 * @returns {code is FormatCode}
 */
function isFormatCode(code: string): code is FormatCode {
  return /[k-o]/.test(code);
}

/**
 * Convert Minecraft lore to HTML
 * @param {string} text minecraft lore with color and formatting codes
 * @returns {string} HTML
 */
export function renderLore(text: string): string {
  let output = "";

  let color: ColorCode | null = null;
  const formats: Set<FormatCode> = new Set();

  const matches = text.match(/(§[0-9A-Fa-fk-orL])*[^§]*/g);
  if (matches === null) return output;
  for (let part of matches) {
    formats.clear();
    while (part.charAt(0) === "§") {
      const code = part.charAt(1).toLowerCase();

      if (isColorCode(code)) {
        color = code;
      } else if (isFormatCode(code)) {
        formats.add(code);
      } else if (code === "r") {
        color = null;
        formats.clear();
      }

      part = part.substring(2);
    }

    if (part.length === 0) {
      output += "<br>";
      continue;
    }

    const timeRegex = /<local-time timestamp="(\d+)"><\/local-time>/;
    const timeMatch = part.match(timeRegex);
    // Delete the timestamp from the lore
    if (timeMatch) {
      // part = part.replace(timeRegex, dateFormat(fromUnixTime(obtained), "dd MMMM yyyy 'at' HH:mm"));
      // TODO: Add the timestamp to the lore
      part = "TODO: ADD LATER";
    }

    output += "<span";

    if (color !== null) {
      if (color == "9" && MAX_ENCHANTS.has(part)) {
        output += ` style='color: var(--§6)'`;
      } else {
        output += ` style='color: var(--§${color});'`;
      }
    }

    if (formats.size > 0) {
      output += ` class='${Array.from(formats, (x) => "§" + x).join(" ")}'`;
    }

    output += `>${part}</span>`;
  }

  return output;
}

/**
 * Checks if an item is enchanted
 * @param {Item} item The item to check
 * @returns  {boolean} Whether the item is enchanted
 */
export function isEnchanted(item: ProcessedItem): boolean {
  // heads
  if ([397].includes(item.id)) {
    return false;
  }

  // enchanted book, bottle o' enchanting, nether star
  if ([403, 384, 399].includes(item.id)) {
    return true;
  }

  //potions with actual effects (not water bottles)
  if (item.id === 373 && item.Damage !== 0) {
    return true;
  }

  if ("tag" in item && Array.isArray(item.tag.ench)) {
    return true;
  }

  if (item.glowing) {
    return true;
  }

  return false;
}

/**
 * Removes Minecraft formatting codes from a string
 * @param {string} string
 * @returns {string}
 */
export function removeFormatting(string: string): string {
  return string.replaceAll(/§[0-9a-z]/g, "");
}

/**
 * Returns a new array with unique elements based on the specified key.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} arr - The array to filter for unique elements.
 * @param {string} key - The key to determine uniqueness.
 * @returns {T[]} A new array with unique elements based on the specified key.
 */
export function uniqBy<T>(arr: T[], key: string) {
  const seen = new Set();
  return arr.filter((item) => {
    const k = (item as Record<string, unknown>)[key];
    return seen.has(k) ? false : seen.add(k);
  });
}
