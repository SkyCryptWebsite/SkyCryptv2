import type { WithId, Document } from 'mongodb';
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
	const collections = await MONGO.collection('collections').find().toArray();
	collections.forEach((collection: WithId<Document>) => {
		for (const category in collection) {
			COLLECTIONS.set(category, collection[category] as Collection);
		}
	});
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
