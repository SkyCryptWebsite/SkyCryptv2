import type { Item, ProcessedItem } from '$types/stats';
import { getPrices } from 'skyhelper-networth';
import * as constants from './constants';
import { getTexture } from './custom_resources';

export * from '$lib/helper/cache';
export * from '$lib/helper/item';

/**
 * Converts an RGB color value to its corresponding hexadecimal representation.
 * @param rgb - The RGB color value in the format "r, g, b".
 * @returns The hexadecimal representation of the RGB color value.
 */
export function rgbToHex(rgb: string) {
	const [r, g, b] = rgb.split(',').map((c) => parseInt(c.trim()));

	return [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

/**
 * converts a string to a number if it can be converted
 * @param {string} key
 * @returns {string|number}
 */
function getKey(key: string): string {
	const intKey = Number(key);

	if (!isNaN(intKey)) {
		return intKey.toString();
	}

	return key;
}

/**
 * @param {any} obj an object
 * @param  {...(string|number)} keys a path
 * @returns {boolean} if the path exists on the object
 */
export function hasPath(obj: { [key: string]: any }, ...keys: string[]) {
	if (obj == null) {
		return false;
	}

	let loc = obj;

	for (let i = 0; i < keys.length; i++) {
		loc = loc[getKey(keys[i])];

		if (loc === undefined) {
			return false;
		}
	}

	return true;
}

/**
 * @param {any} obj an object
 * @param  {...(string|number)} keys a path
 * @returns {any} the value at the path on the object
 */
export function getPath(obj: { [key: string]: any }, ...keys: string[]) {
	if (obj == null) {
		return undefined;
	}

	let loc = obj;

	for (let i = 0; i < keys.length; i++) {
		loc = loc[getKey(keys[i])];

		if (loc === undefined) {
			return undefined;
		}
	}

	return loc;
}

/**
 * Retrieves the ID of a SkyBlock item.
 * @param item The SkyBlock item.
 * @returns The ID of the item, or an empty string if the ID is not found.
 */
export function getId(item: ProcessedItem | Item) {
	return item?.tag?.ExtraAttributes?.id ?? '';
}

export function getTextureValue(item: Item) {
	return item?.tag?.SkullOwner?.Properties?.textures?.at(0)?.Value ?? '';
}

/**
 * Get Minecraft lore without the color and formatting codes
 * @param {string} text lore with color codes
 * @returns {string} lore without color codes
 */
export function getRawLore(text: string) {
	return text.replaceAll(/§[0-9a-fk-or]/g, '');
}

/**
 * @param {string} s
 * @returns {string}
 */
export function titleCase(s: string) {
	return s[0].toUpperCase() + s.slice(1);
}

export function rarityNameToInt(string: string) {
	return constants.RARITIES.indexOf(string.toLowerCase());
}

export function formatNumber(n: number, digits = 2) {
	return Intl.NumberFormat('en-US', {
		notation: 'compact',
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	})
		.format(n)
		.replace(/\.0+([A-Za-z])?$/, '$1');
}

/**
 * Returns the price of the item. Returns 0 if the item is not found or if the item argument is falsy.
 * @param {string} item - The ID of the item to retrieve the price for.
 * @returns {number}
 * @returns {Promise<number>}
 */
export async function getItemPrice(item: string | ProcessedItem) {
	if (!item) return 0;

	const prices = await getPrices(true);

	if (typeof item === 'string') {
		return prices[item.toLowerCase() as keyof typeof prices] ?? 0;
	}

	return prices[getId(item).toLowerCase() as keyof typeof prices] ?? 0;
}

/**
 * Adds lore to an item's display tag.
 *
 * @param {Item} item - The item to add lore to.
 * @param {string|string[]} lore - The lore to add to the item. If a string is provided, it will be converted to an array.
 * @returns {Item} The modified item.
 */
export function addToItemLore(item: Partial<ProcessedItem>, lore: string | string[]) {
	if (typeof lore === 'string') {
		lore = [lore];
	}

	item.tag ??= {};
	item.tag.display ??= {};
	item.tag.display.Lore ??= [];
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
		item.texture_path = (customTexture.path ?? '').toString();
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

	if (id !== null && typeof id === 'string') {
		// Hegemony artifact provides double MP
		if (id === 'HEGEMONY_ARTIFACT') {
			return 2 * (constants.MAGICAL_POWER[rarity as keyof typeof constants.MAGICAL_POWER] ?? 0);
		}

		// Rift Prism grants 11 MP
		if (id === 'RIFT_PRISM') {
			return 11;
		}
	}

	return constants.MAGICAL_POWER[rarity as keyof typeof constants.MAGICAL_POWER] ?? 0;
}
