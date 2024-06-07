import type { Member } from '$types/global';
import * as constants from '$constants/constants';
import * as helper from '$lib/helper';
import _ from 'lodash';

function getTrophyFish(userProfile: Member) {
	if (userProfile.trophy_fish === undefined) {
		return {};
	}

	// NOTE: needed here cuz of the reverse() method, we love JavaScript..
	const reverstedTiers = _.clone(constants.TROPHY_FISH_TIERS).reverse();

	const output = [];
	for (const [id, data] of Object.entries(constants.TROPHY_FISH)) {
		const trophyFish = {
			id: id,
			name: data.display_name,
			description: data.description
		} as Record<string, string | number | boolean>;

		for (const tier of constants.TROPHY_FISH_TIERS) {
			trophyFish[tier] = userProfile.trophy_fish[`${id.toLowerCase()}_diamond`] ?? 0;
		}

		const highestTier =
			constants.TROPHY_FISH_TIERS.find((tier) => userProfile.trophy_fish[`${id.toLowerCase()}_${tier}`] > 0) ??
			'bronze';

		trophyFish.texture = data.textures[highestTier];
		trophyFish.maxed = highestTier === reverstedTiers.at(-1);

		output.push(trophyFish);
	}

	return output;
}

export function getFishing(userProfile: Member) {
	const kills = [] as { id: string; name: string; amount: number }[];
	for (const mob of constants.SEA_CREATURES) {
		kills.push({
			id: mob,
			name: constants.MOB_NAMES[mob] ?? mob.split('_').map(helper.titleCase).join(' '),
			amount: userProfile.player_stats.kills[mob] ?? 0
		});
	}

	return {
		treasure: userProfile.player_stats.items_fished?.treasure ?? 0,
		treasureLarge: userProfile.player_stats.items_fished?.large_treasure ?? 0,
		shredderFished: userProfile.player_stats.shredder_rod?.fished ?? 0,
		shredderBait: userProfile.player_stats.shredder_rod?.bait ?? 0,
		trophyFishCaught: userProfile.player_stats.items_fished?.trophy_fish ?? 0,
		kills: kills,
		trophyFish: getTrophyFish(userProfile)
	};
}
