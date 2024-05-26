import type { Player } from '$types/raw/player/lib';
import { getLevelByXp } from '$lib/stats/leveling/leveling';
import type { Member } from '$types/global';
import * as constants from '$lib/constants';
import { getHotmItems } from './hotm';

/**
 * @param {number} hotmTier
 * @param {number} potmTier
 * @returns {number}
 */
export function calcHotmTokens(hotmTier: number, potmTier: number) {
	let tokens = 0;

	for (let tier = 1; tier <= hotmTier; tier++) {
		tokens += constants.HOTM.rewards.hotm[tier]?.token_of_the_mountain || 0;
	}

	for (let tier = 1; tier <= potmTier; tier++) {
		tokens += (constants.HOTM.rewards.potm[tier]?.token_of_the_mountain || 0) as number;
	}

	return tokens;
}

function getCommissionMilestone(userProfile: Member) {
	if (userProfile.objectives?.tutorial === undefined) {
		return 0;
	}

	return userProfile.objectives.tutorial.reduce((acc, key) => {
		if (key.startsWith('commission_milestone_reward_mining_xp_tier_') === false) {
			return acc;
		}

		const tier = parseInt(key.slice(43));
		return Math.max(acc, tier);
	}, 0);
}

function getCrystalNucleusRunData(userProfile: Member) {
	const output = { crystals: {}, parts: {} } as { crystals: Record<string, string>; parts: Record<string, string> };
	for (const crystal of constants.GEMSTONE_CRYSTALS) {
		output.crystals[crystal] = userProfile.mining_core.crystals?.[`${crystal}_crystal`]?.state ?? 'NOT_FOUND';
	}

	for (const part in constants.PRECURSOR_PARTS) {
		output.parts[part] = userProfile.mining_core.biomes.precursor.parts_delivered?.includes(part)
			? 'DELIVERED'
			: 'NOT_DELIVERED';
	}

	return output;
}

export function getMining(userProfile: Member, player: Player) {
	const HOTM = getLevelByXp(userProfile.mining_core.experience, { type: 'hotm' });
	const totalTokens = calcHotmTokens(HOTM.level, userProfile.mining_core.nodes?.special_0 ?? 0);
	const crystalNucleusRuns = Math.min(
		...Object.values(userProfile.mining_core.crystals ?? {})
			.filter((x) => x.total_placed)
			.map((x) => x.total_placed ?? 0)
	);

	return {
		level: HOTM,
		perks: userProfile.mining_core.nodes,
		selected_pickaxe_ability: constants.HOTM.names[userProfile.mining_core.selected_pickaxe_ability] ?? 'None',
		tokens: {
			total: totalTokens,
			spent: userProfile.mining_core.tokens_spent ?? 0,
			available: totalTokens - (userProfile.mining_core.tokens_spent ?? 0)
		},
		commissions: {
			milestone: getCommissionMilestone(userProfile),
			completions: player.achievements.skyblock_hard_working_miner || 0
		},
		crystal_hollows: {
			crystal_hollows_last_access: userProfile.mining_core.greater_mines_last_access,
			nucleus_runs: crystalNucleusRuns,
			progress: getCrystalNucleusRunData(userProfile)
		},
		hotm: getHotmItems(userProfile)
	};
}
