import MONGO from '$db/mongo';

export type Collection = {
	name: string;
	items: {
		id: string;
		name: string;
		texture: string;
		maxTier: number;
		tiers: {
			tier: number;
			amountRequired: number;
			unlocks: string[];
		}[];
	}[];
};

export const COLLECTIONS = new Map<string, Collection>();

async function updateCollections() {
	const collections = await MONGO.collection('collections').findOne({});
	if (collections?.collections == null) {
		return;
	}

	for (const category in collections.collections) {
		// TODO: Make this more robust
		if (['lastUpdated', '_id'].includes(category)) {
			continue;
		}

		COLLECTIONS.set(category, collections.collections[category] as Collection);
	}
}

updateCollections();
setTimeout(updateCollections, 1000 * 60 * 60 * 12); // 12 hours

export const COLLECTION_ICONS = {
	farming: 'GOLDEN_HOE',
	mining: 'STONE_PICKAXE',
	combat: 'STONE_SWORD',
	foraging: 'JUNGLE_SAPLING',
	fishing: 'FISHING_ROD',
	rift: 'MYCELIUM'
} as Record<string, string>;
