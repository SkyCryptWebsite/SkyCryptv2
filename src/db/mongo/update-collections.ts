import type { Collection } from '$constants/collections';
import MONGO from '$db/mongo';

const headers = { Accept: 'application/json', 'User-Agent': 'SkyCrypt' };
const updateInterval = 1000 * 60 * 60 * 12; // 12 hours

type CollectionResponse = {
	[string: string]: {
		name: string;
		items: Record<string, CollectionItem>;
	};
};

type CollectionItem = {
	name: string;
	maxTiers: number;
	tiers: {
		tier: number;
		amountRequired: number;
		unlocks: string[];
	}[];
};

export async function updateCollections() {
	try {
		const timeNow = Date.now();
		const response = await fetch('https://api.hypixel.net/v2/resources/skyblock/collections', {
			headers: headers
		});
		const data = await response.json();

		const collections = {} as Record<string, Collection>;
		for (const [category, collection] of Object.entries(data.collections as CollectionResponse)) {
			collections[category.toLowerCase()] = {
				name: collection.name,
				items: Object.keys(collection.items).map((id) => {
					return {
						id,
						name: collection.items[id].name,
						texture: `/api/item/${id}`,
						maxTier: collection.items[id].maxTiers,
						tiers: collection.items[id].tiers
					};
				})
			};
		}

		// await MONGO.collection('collections').deleteMany({});

		await MONGO.collection('collections').updateOne({}, { $set: collections }, { upsert: true });

		console.log(`[COLLECTIONS] Updated collections in ${(Date.now() - timeNow).toLocaleString()}ms`);
	} catch (e) {
		console.error(e);
	}

	setTimeout(updateCollections, updateInterval);
}
