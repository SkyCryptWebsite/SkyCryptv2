import MONGO from '$db/mongo';
import _ from 'lodash';

const headers = { Accept: 'application/json', 'User-Agent': 'SkyCrypt' };
const updateInterval = 1000 * 60 * 60 * 12; // 12 hours

export async function updateItems() {
	try {
		const timeNow = Date.now();
		const response = await fetch('https://api.slothpixel.me/api/skyblock/items', {
			headers: headers
		});
		const data = await response.json();

		const items = Object.keys(data).map((skyblockId) => {
			const skyblockItem = data[skyblockId];

			const item = {
				skyblock_id: skyblockId,
				id: data.item_id,
				damage: 0,
				tier: 'common'
			};

			return Object.assign(item, skyblockItem);
		});

		const chunks = _.chunk(items, 250);
		const promises = chunks.map((chunk) => {
			const bulkOps = chunk.map((item) => ({
				updateOne: {
					filter: { skyblock_id: item.skyblock_id },
					update: { $set: item },
					upsert: true
				}
			}));

			return MONGO.collection('items').bulkWrite(bulkOps);
		});

		await Promise.all(promises);

		console.log(`[ITEMS] Updated items in ${(Date.now() - timeNow).toLocaleString()}ms`);
	} catch (e) {
		console.error(e);
	}

	setTimeout(updateItems, updateInterval);
}
