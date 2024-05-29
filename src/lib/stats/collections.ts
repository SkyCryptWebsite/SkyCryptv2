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

	if (collectionData === undefined) {
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
		total_amount: totalAmount,
		tier,
		max_tier: maxTier,
		amounts
	};
}

export function getCollections(userProfile: Member, profile: Profile) {
	const output = { categories: {} } as Collections;
	for (const [category, categoryData] of constants.COLLECTIONS) {
		if (category === '_id') {
			continue;
		}

		output.categories[category] = {
			name: categoryData.name,
			texture: '/item/' + constants.COLLECTION_ICONS[category],
			items: [],
			total_tiers: 0,
			max_tiers: 0
		};

		for (const collection of categoryData.items) {
			const { id, name, maxTier, texture } = collection;

			const amount = userProfile.collection[id] ?? 0;

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
				total_amount: totalAmount,
				tier,
				max_tier: maxTier,
				amounts
			});
		}

		output.categories[category].total_tiers = output.categories[category].items.length;

		output.categories[category].max_tiers = output.categories[category].items.filter(
			(a) => a.tier === a.max_tier
		).length;
	}

	output.total_collections = Object.values(output.categories).reduce((a, b) => a + b.items.length, 0);

	output.maxed_collections = Object.values(output.categories)
		.map((a) => a.items)
		.flat()
		.filter((a) => a && a.tier === a.max_tier).length;

	return output;
}
