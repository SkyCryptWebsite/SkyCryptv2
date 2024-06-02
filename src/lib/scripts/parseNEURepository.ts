import type { NEUItem } from '$types/processed/other/NotEnoughUpdates';
import fs from 'node:fs';
import { NBTParser } from './NBTParser';

export const NEU_ITEMS = new Map<string, NEUItem>();
export const NEU_CONSTANTS = new Map();

export async function parseNEURepository() {
	const timeNow = performance.now();

	const items = fs.readdirSync('src/lib/constants/NotEnoughUpdates-REPO/items');
	for (const item of items) {
		const itemData = JSON.parse(fs.readFileSync(`src/lib/constants/NotEnoughUpdates-REPO/items/${item}`, 'utf8'));

		itemData.nbttag = NBTParser.parse(itemData.nbttag);

		NEU_ITEMS.set(itemData.internalname, itemData);
	}

	const constants = fs.readdirSync('src/lib/constants/NotEnoughUpdates-REPO/constants');
	for (const constant of constants) {
		if (constant === 'petnums.json') {
			const petNums = JSON.parse(
				fs.readFileSync(`src/lib/constants/NotEnoughUpdates-REPO/constants/${constant}`, 'utf8')
			);

			NEU_CONSTANTS.set('pets', petNums);
		}
	}

	console.log(`Parsed ${items.length.toLocaleString()} items in ${(performance.now() - timeNow).toLocaleString()}ms`);
}

parseNEURepository();
