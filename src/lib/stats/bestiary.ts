import type { Member } from '$types/global';
import * as constants from '$constants/constants';
import type { BestiaryStats } from '$types/processed/profile/bestiary';

function getBestiaryMobs(
	bestiary: Record<string, number>,
	mobList: {
		name: string;
		cap: number;
		texture: string;
		mobs: string[];
		bracket: number;
	}[]
) {
	const output = [];
	for (const mob of mobList) {
		const mobBracket = constants.BESTIARY_BRACKETS[mob.bracket];

		const totalKills = mob.mobs.reduce((acc, mob) => acc + (bestiary[mob] || 0), 0);
		const maxKills = mob.cap;
		const nextTierKills = mobBracket.find((tier: number) => totalKills < tier && tier <= maxKills);
		const tier = nextTierKills ? mobBracket.indexOf(nextTierKills) : mobBracket.indexOf(maxKills) + 1;

		output.push({
			name: mob.name,
			texture: mob.texture,
			kills: totalKills,
			nextTierKills: nextTierKills ?? null,
			maxKills: maxKills,
			tier: tier,
			maxTier: mobBracket.indexOf(maxKills) + 1
		});
	}

	return output;
}

export function getBestiary(userProfile: Member) {
	const bestiary = userProfile.bestiary.kills || {};

	const categories = {} as BestiaryStats['categories'];
	for (const [category, categoryData] of Object.entries(constants.BESTIARY)) {
		categories[category] = {
			name: categoryData.name,
			texture: categoryData.texture,
			mobs: getBestiaryMobs(bestiary, categoryData.mobs),
			mobsUnlocked: 0,
			mobsMaxed: 0
		};

		categories[category].mobsUnlocked = categories[category].mobs.reduce(
			(acc, mob) => acc + (mob.kills > 0 ? 1 : 0),
			0
		);
		categories[category].mobsMaxed = categories[category].mobs.reduce(
			(acc, mob) => acc + (mob.kills >= mob.maxKills ? 1 : 0),
			0
		);
	}

	const mobs = Object.values(categories).flatMap((category) => Object.values(category.mobs));
	const maxMilestone = mobs.map((mob) => mob.maxTier).reduce((acc, cur) => acc + cur, 0);
	const milestone = mobs.map((mob) => mob.tier).reduce((acc, cur) => acc + cur, 0);
	const familiesMaxed = mobs.filter((mob) => mob.tier === mob.maxTier).length;
	const familiesUnlocked = mobs.filter((mob) => mob.kills > 0).length;
	const totalFamilies = mobs.length;

	return {
		categories,
		milestone,
		maxMilestone,
		familiesUnlocked,
		totalFamilies,
		familiesMaxed
	};
}
