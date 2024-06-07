import type { Collections, Member, Profile } from '$types/global';
import * as constants from '$constants/constants';

export function getCollection(userProfile: Member, profile: Profile, collection: string) {
	let collectionData;
	for (const value of constants.COLLECTIONS.values()) {
		if (value.items === undefined || value.items.find((a) => a.id === collection) === undefined) {
			continue;
		}

		collectionData = value.items.find((a) => a.id === collection);
	}

	if (collectionData === undefined || userProfile.collection === undefined) {
		return null;
	}

	const { id, name, maxTier, texture } = collectionData;

	const amount = userProfile.collection[id] ?? 0;

	const amounts = Object.keys(profile.members).map((uuid) => {
		return {
			username: uuid,
			amount: (profile.members[uuid].collection && profile.members[uuid].collection[id]) ?? 0
		};
	});

	const totalAmount = amounts.reduce((a, b) => a + b.amount, 0);

	const tier = collectionData.tiers.findLast((a) => a.amountRequired <= totalAmount)?.tier ?? 0;

	return {
		name,
		id,
		texture,
		amount,
		totalAmount: totalAmount,
		tier,
		maxTier: maxTier,
		amounts
	};
}

export function getCollections(userProfile: Member, profile: Profile) {
	const output = { categories: {} } as Collections;
	for (const [category, categoryData] of constants.COLLECTIONS) {
		output.categories[category] = {
			name: categoryData.name,
			texture: '/api/item/' + constants.COLLECTION_ICONS[category],
			items: [],
			totalTiers: 0,
			maxTiers: 0
		};

		for (const collection of categoryData.items) {
			const { id, name, maxTier, texture } = collection;

			const amount = (userProfile.collection && userProfile.collection[id]) ?? 0;

			const amounts = Object.keys(profile.members).map((uuid) => {
				return {
					username: uuid,
					amount: (profile.members[uuid].collection && profile.members[uuid].collection[id]) ?? 0
				};
			});

			const totalAmount = amounts.reduce((a, b) => a + b.amount, 0);

			const tier = collection.tiers.findLast((a) => a.amountRequired <= totalAmount)?.tier ?? 0;

			output.categories[category].items.push({
				name,
				id,
				texture,
				amount,
				totalAmount,
				tier,
				maxTier: maxTier,
				amounts
			});
		}

		output.categories[category].totalTiers = output.categories[category].items.length;

		output.categories[category].maxTiers = output.categories[category].items.filter((a) => a.tier === a.maxTier).length;
	}

	output.totalCollections = Object.values(output.categories).reduce((a, b) => a + b.items.length, 0);

	output.maxedCollections = Object.values(output.categories)
		.map((a) => a.items)
		.flat()
		.filter((a) => a && a.tier === a.maxTier).length;

	return output;
}
