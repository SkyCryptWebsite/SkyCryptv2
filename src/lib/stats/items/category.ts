import { itemSorter } from '$lib/stats/items/processing';
import * as constants from '$constants';
import * as helper from '$lib/helper';
import type { ProcessedItem } from '$types/stats';

export function getCategory(allItems: ProcessedItem[], category: string) {
	const output = allItems.filter((a) => a.categories?.includes(category));

	for (const item of allItems) {
		if (!Array.isArray(item.containsItems)) {
			continue;
		}

		output.push(...getCategory(item.containsItems, category));
	}

	return output.sort(itemSorter);
}

export function getWeapons(allItems: ProcessedItem[]) {
	const weapons = getCategory(allItems, 'weapon');

	const countsOfId: { [key: string]: number } = {};
	for (const weapon of weapons) {
		const id = helper.getId(weapon);

		countsOfId[id] = (countsOfId[id] || 0) + 1;

		if (countsOfId[id] > 2 && constants.RARITIES.indexOf(weapon.rarity) < constants.RARITIES.indexOf('legendary')) {
			weapon.hidden = true;
		}
	}

	const highestPriorityWeapon = getCategory(allItems, 'sword').filter((a) => a.backpackIndex === undefined)[0];

	return {
		weapons: weapons,
		highest_priority_weapon: highestPriorityWeapon
	};
}
export function getSkilllTools(skill: string, allItems: ProcessedItem[]) {
	const tools = getCategory(allItems, `${skill}_tool`);

	const highestPriorityTool = getCategory(allItems, `${skill}_tool`).filter((a) => a.backpackIndex === undefined)[0];

	return {
		tools: tools,
		highest_priority_tool: highestPriorityTool
	};
}

export function getPets(allItems: ProcessedItem[]) {
	const output = allItems
		.filter((a: ProcessedItem) => a.tag?.ExtraAttributes?.petInfo)
		.map((a: ProcessedItem) => ({
			uuid: a.tag.ExtraAttributes.uuid,
			type: a.tag.ExtraAttributes.petInfo.type,
			exp: a.tag.ExtraAttributes.petInfo.exp,
			active: a.tag.ExtraAttributes.petInfo.active,
			tier: a.tag.ExtraAttributes.petInfo.tier,
			heldItem: a.tag.ExtraAttributes.petInfo.heldItem || null,
			candyUsed: a.tag.ExtraAttributes.petInfo.candyUsed,
			skin: a.tag.ExtraAttributes.petInfo.skin || null
		}));

	for (const item of allItems) {
		if (!Array.isArray(item.containsItems)) {
			continue;
		}

		output.push(
			...item.containsItems
				.filter((a) => a.tag?.ExtraAttributes?.petInfo)
				.map((a) => ({
					uuid: a.tag.ExtraAttributes.uuid,
					type: a.tag.ExtraAttributes.petInfo.type,
					exp: a.tag.ExtraAttributes.petInfo.exp,
					active: a.tag.ExtraAttributes.petInfo.active,
					tier: a.tag.ExtraAttributes.petInfo.tier,
					heldItem: a.tag.ExtraAttributes.petInfo.heldItem || null,
					candyUsed: a.tag.ExtraAttributes.petInfo.candyUsed,
					skin: a.tag.ExtraAttributes.petInfo.skin || null
				}))
		);
	}

	return output;
}
