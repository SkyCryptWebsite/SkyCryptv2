import type { DatabaseItem } from '$types/global';
import type { WithId, Document } from 'mongodb';
import MONGO from '$db/mongo';

export const ITEMS = new Map<string, DatabaseItem>();

async function updateItems() {
	const items = await MONGO.collection('items').find().toArray();
	items.forEach((item: WithId<Document>) => {
		const skyBlockItem = item as unknown as DatabaseItem;
		if (skyBlockItem.skyblock_id === undefined) {
			return;
		}

		ITEMS.set(skyBlockItem.skyblock_id, skyBlockItem);
	});
}

updateItems();
setTimeout(updateItems, 1000 * 60 * 60 * 12); // 12 hours
