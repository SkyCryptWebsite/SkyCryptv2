import type { Profile } from '$types/global';
import * as constants from '$constants/constants';
import * as helper from '$lib/helper';
import type { MinionCategory, MinionCategoryType, Minions } from '$types/processed/profile/minions';

function getMinionSlots(profile: Profile, tiers: number) {
	const minionSlots = Object.keys(constants.MINION_SLOTS).map((s) => parseInt(s)) as number[];
	const highestSlots = minionSlots.findLastIndex((slots) => tiers >= slots);

	return {
		bonus_slots: profile.community_upgrades.upgrade_states.filter((u) => u.upgrade === 'minion_slots').length,
		current: constants.MINION_SLOTS[minionSlots[highestSlots]],
		next: minionSlots[highestSlots + 1] - tiers
	};
}

export function getMinions(profile: Profile) {
	const craftedMinions = Object.keys(profile.members)
		.map((uuid) => {
			return profile.members[uuid].player_data?.crafted_generators ?? [];
		})
		.flat();

	const output = { minions: {} } as Minions;
	for (const category in constants.MINIONS) {
		output.minions[category as MinionCategoryType] = {
			minions: [],
			total_minions: 0,
			maxed_minions: 0,
			total_tiers: 0,
			maxed_tiers: 0
		};

		for (const minion in constants.MINIONS[category]) {
			const minionData = constants.MINIONS[category][minion];

			output.minions[category as MinionCategoryType].minions.push({
				name: minionData.name ?? minion.toLowerCase().split('_').map(helper.titleCase).join(' '),
				texture: minionData.texture,
				maxTier: minionData.maxTier ?? 11,
				tiers: craftedMinions
					.filter((m) => m.split('_').slice(0, -1).join('_') === minion)
					.map((m) => parseInt(m.split('_').at(-1) as string))
					.sort((a, b) => a - b)
			});
		}

		Object.assign(output.minions[category as MinionCategoryType], {
			total_minions: Object.keys(constants.MINIONS[category]).length,
			maxed_minions: output.minions[category as MinionCategoryType].minions.filter((m) => m.tiers.length === m.maxTier)
				.length,
			total_tiers: Object.values(constants.MINIONS[category]).reduce((acc, m) => acc + (m.maxTier ?? 11), 0),
			maxed_tiers: output.minions[category as MinionCategoryType].minions.reduce((acc, m) => acc + m.tiers.length, 0)
		});
	}

	const allMinions = Object.values(output.minions).filter((c): c is MinionCategory => typeof c !== 'number');
	Object.assign(output, {
		total_minions: allMinions.reduce((acc, c) => acc + c.total_minions, 0),
		maxed_minions: allMinions.reduce((acc, c) => acc + c.maxed_minions, 0),
		total_tiers: allMinions.reduce((acc, c) => acc + c.total_tiers, 0),
		maxed_tiers: allMinions.reduce((acc, c) => acc + c.maxed_tiers, 0),
		minions_slots: getMinionSlots(
			profile,
			allMinions.reduce((acc, c) => acc + c.maxed_tiers, 0)
		)
	});

	return output;
}
