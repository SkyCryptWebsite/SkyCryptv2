import type { Member, SlayerBoss } from '$types/global';
import * as constants from '$constants';
import type { Slayer } from '$types/processed/profile/slayer';

function getKills(slayer: SlayerBoss) {
	const killKeys = Object.keys(slayer).filter((key) => key.startsWith('boss_kills_tier_'));

	const output = {} as Record<string, number>;
	for (const key of killKeys) {
		const tier = (parseInt(key.split('_').at(-1) as string) + 1).toString();

		output[tier] = slayer[key as keyof typeof slayer] as number;
	}

	output.total = Object.values(output).reduce((acc, kills) => acc + kills, 0);

	return output;
}

function getLevel(slayer: string, data: SlayerBoss) {
	if (constants.SLAYER_XP[slayer] === undefined) {
		return {
			xp: 0,
			level: 0,
			maxLevel: 0,
			xpCurrent: 0,
			xpForNext: 0,
			maxed: false
		};
	}

	const reversed = Object.entries(constants.SLAYER_XP[slayer]).reverse();

	const maxLevel = Object.keys(constants.SLAYER_XP[slayer]).length;
	for (const [level, xp] of reversed) {
		if (data.xp > xp) {
			const xpForNext = xp;
			return {
				xp: data.xp,
				xpForNext,
				level: parseInt(level),
				maxLevel,
				maxed: parseInt(level) === maxLevel
			};
		}
	}

	return {
		xp: data.xp,
		xpForNext: 0,
		level: 0,
		maxLevel,
		maxed: false
	};
}

export function getSlayer(userProfile: Member) {
	const slayerData = userProfile.slayer?.slayer_bosses;
	if (slayerData === undefined) {
		return null;
	}

	const output = { data: {} } as Slayer;
	for (const id of constants.SLAYERS) {
		const data = slayerData[id];
		output.data[id] = {
			name: constants.SLAYER_INFO[id].name,
			texture: constants.SLAYER_INFO[id].head,
			kills: getKills(data),
			level: getLevel(id, data)
		};
	}

	output.total_slayer_xp = Object.values(slayerData).reduce((acc, boss) => acc + boss.xp, 0);

	return output;
}
