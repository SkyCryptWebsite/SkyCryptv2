import * as constants from '../constants/constants';
import sanitize from 'mongo-sanitize';
import * as helper from '../helper';
import type { DatabaseItem, Item, ItemQuery } from '$types/stats';

/**
 * Gathers Item Data visualized similarily to in-game NBT format based on a query
 * @param {Object} query Query with optional properties
 * @param {string} [query.skyblockId] Item SkyBlock ID
 * @param {number} [query.id] Item Vanilla ID
 * @param {string} [query.name] Item name
 * @param {number} [query.damage] Item damage value
 * @returns {*} Item Data
 */
export async function getItemData(query: ItemQuery) {
	query = Object.assign({ skyblockId: undefined, id: undefined, name: undefined, damage: undefined }, query);
	const item: Item = { id: -1, damage: 0, Count: 1, tag: { ExtraAttributes: {} } };
	let dbItem: DatabaseItem = {};

	if (query.skyblockId) {
		query.skyblockId = sanitize(query.skyblockId);

		if (query.skyblockId !== undefined && query.skyblockId.includes(':')) {
			const split = query.skyblockId.split(':');

			query.skyblockId = split[0];
			query.damage = Number(split[1]);
		}

		dbItem = { ...(item as unknown as DatabaseItem), ...constants.ITEMS.get(query.skyblockId) };
	}

	if (query && query.name !== undefined) {
		const results = Object.values(constants.ITEMS) as DatabaseItem[];

		const filteredResults = results.filter((a) => a.name && a.name.toLowerCase() == (query.name ?? '').toLowerCase());

		if (filteredResults.length > 0) {
			dbItem = filteredResults[0] ?? {};
		}
	}

	if (query.id !== undefined) {
		item.id = query.id;
	}

	if (query.name !== undefined) {
		item.tag.display = { Name: query.name };
	}

	if ('item_id' in dbItem) {
		item.id = dbItem.item_id as number;
	}

	if ('damage' in dbItem) {
		item.damage = query.damage ?? (dbItem.damage as number);
	}

	if ('name' in dbItem) {
		item.tag.display = { Name: dbItem.name as string };
	}

	if ('id' in dbItem) {
		item.tag.ExtraAttributes.id = dbItem.skyblock_id;
	}

	if ('texture' in dbItem) {
		item.texture = dbItem.texture as string;
	}

	if (dbItem.item_id && dbItem.item_id >= 298 && dbItem.item_id <= 301) {
		const type = ['helmet', 'chestplate', 'leggings', 'boots'][dbItem.item_id - 298];

		if (dbItem.color !== undefined) {
			const color = helper.rgbToHex(dbItem.color) ?? '955e3b';

			item.texture_path = `/api/leather/${type}/${color}`;
		}
	}

	if ('material' in dbItem) {
		item.material = dbItem.material as string;
	}

	return item;
}
