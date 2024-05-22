export * from '$lib/helper/cache';

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
export function getId(item: any) {
	return item?.tag?.ExtraAttributes?.id ?? '';
}

export function getTextureValue(item: any) {
	return item?.tag?.SkullOwner?.Properties?.textures?.at(0)?.Value ?? '';
}
