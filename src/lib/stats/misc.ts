import type { Member, Profile } from '$types/global';
import * as constants from '$constants/constants';
import * as helper from '$lib/helper';
import type { Player } from '$types/raw/player/lib';

function getEssence(userProfile: Member) {
	const output = [];
	for (const [id, essence] of Object.entries(constants.ESSENCE)) {
		output.push({
			name: essence.name,
			id: id,
			texture: essence.texture,
			amount: (userProfile.currencies?.essence && userProfile.currencies.essence[id.toUpperCase()]?.current) ?? 0
		});
	}

	return output;
}

function formatKillsAndDeaths(userProfile: Member) {
	const kills = [] as { id: string; name: string; amount: number }[];
	for (const id in userProfile.player_stats.kills) {
		if (id === 'total') {
			continue;
		}

		kills.push({
			id: id,
			name: constants.MOB_NAMES[id] ?? id.split('_').map(helper.titleCase).join(' '),
			amount: userProfile.player_stats.kills[id] ?? 0
		});
	}

	const deaths = [] as { id: string; name: string; amount: number }[];
	for (const id in userProfile.player_stats.deaths) {
		if (id === 'total') {
			continue;
		}

		deaths.push({
			id: id,
			name: constants.MOB_NAMES[id] ?? id.split('_').map(helper.titleCase).join(' '),
			amount: userProfile.player_stats.deaths[id] ?? 0
		});
	}

	return {
		totalKills: kills.reduce((acc, mob) => acc + mob.amount, 0),
		totalDeaths: deaths.reduce((acc, mob) => acc + mob.amount, 0),
		kills: kills,
		deaths: deaths
	};
}

function getRaces(userProfile: Member) {
	const races = userProfile.player_stats.races;
	if (races == undefined) {
		return {};
	}

	const output: {
		[id: string]: {
			name: string;
			races: Record<
				string,
				| { name: string; time: number }
				| {
						with_return: Record<string, { name: string; time: number }>;
						no_return: Record<string, { name: string; time: number }>;
				  }
			>;
		};
	} = {};
	for (let [id, data] of Object.entries(races)) {
		if (typeof data === 'number') {
			output.other = output.other ?? {
				name: 'Other',
				races: {}
			};

			const raceId = id.replace('_best_time', '');
			const raceName = constants.RACE_NAMES[raceId] ?? helper.titleCase(raceId.replace('_', ' '));

			output.other.races[raceId] = {
				name: raceName,
				time: data
			};
		} else {
			for ([id, data] of Object.entries(data)) {
				const shortId = id.split('_').slice(0, 2).join('_');
				const raceId = id.replace(`${shortId}_`, '').replace('_best_time', '');
				const raceName = constants.RACE_NAMES[shortId] ?? helper.titleCase(shortId.replace('_', ' '));

				output[shortId] = output[shortId] || {
					name: raceName,
					races: {
						with_return: {},
						no_return: {}
					}
				};

				const isReturn = id.endsWith('_with_return_best_time');
				const dungeonRaceId = raceId.replace(isReturn ? '_with_return' : '_no_return', '');

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				output[shortId].races[isReturn ? 'with_return' : 'no_return'][dungeonRaceId] = {
					name: constants.RACE_NAMES[dungeonRaceId] ?? helper.titleCase(dungeonRaceId.replace('_', ' ')),
					time: data
				};
			}
		}
	}

	return output;
}

function getDragons(userProfile: Member) {
	const dragonKills = Object.keys(userProfile.player_stats.kills)
		.filter((key) => key.endsWith('_dragon') && !key.startsWith('master_wither_king'))
		.reduce(
			(obj, key) => ({ ...obj, [key.replace('_dragon', '')]: userProfile.player_stats.kills[key] }),
			{}
		) as Record<string, number>;

	Object.assign(dragonKills, { total: Object.values(dragonKills).reduce((a, b) => a + b, 0) });

	const dragonDeaths = Object.keys(userProfile.player_stats.deaths)
		.filter((key) => key.endsWith('_dragon') && !key.startsWith('master_wither_king'))
		.reduce(
			(obj, key) => ({ ...obj, [key.replace('_dragon', '')]: userProfile.player_stats.deaths[key] }),
			{}
		) as Record<string, number>;

	Object.assign(dragonDeaths, { total: Object.values(dragonDeaths).reduce((a, b) => a + b, 0) });

	return {
		enderCrystalsDestroyed: userProfile.player_stats?.end_island?.dragon_fight?.ender_crystals_destroyed ?? 0,
		mostDamage: userProfile.player_stats.end_island?.dragon_fight?.most_damage ?? 0,
		fastestKill: userProfile.player_stats.end_island?.dragon_fight?.fastest_kill ?? 0,
		kills: dragonKills,
		deaths: dragonDeaths
	};
}

function getPetMilestone(type: string, amount: number) {
	return {
		amount: amount ?? 0,
		rarity: constants.MILESTONE_RARITIES[constants.PET_MILESTONES[type].findLastIndex((x) => amount >= x)] ?? 'common',
		total: constants.PET_MILESTONES[type].at(-1),
		progress: amount ? Math.min((amount / (constants.PET_MILESTONES[type].at(-1) ?? 1)) * 100, 100).toFixed(2) : 0
	};
}

function getProfileUpgrades(profile: Profile) {
	const output = {} as Record<string, number>;
	for (const upgrade in constants.PROFILE_UPGRADES) {
		output[upgrade] = 0;
	}

	if (profile.community_upgrades?.upgrade_states != undefined) {
		for (const u of profile.community_upgrades.upgrade_states) {
			output[u.upgrade] = Math.max(output[u.upgrade] || 0, u.tier);
		}
	}

	return output;
}

function getClaimedItems(player: Player) {
	const output = {} as Record<string, number>;
	for (const item in constants.CLAIMABLE_ITEMS) {
		if (player[item as keyof Player] != undefined) {
			output[item] = player[item as keyof Player] as unknown as number;
		}
	}

	for (const key of Object.keys(player).filter((key) => key.startsWith('scorpius_bribe_'))) {
		output[key] = player[key as keyof Player] as unknown as number;
	}

	return output;
}

export function getMisc(userProfile: Member, profile: Profile, player: Player) {
	return {
		essence: getEssence(userProfile),
		kills: formatKillsAndDeaths(userProfile),
		races: getRaces(userProfile),
		gifts: {
			given: userProfile.player_stats.gifts?.total_given ?? 0,
			received: userProfile.player_stats.gifts?.total_received ?? 0
		},
		seasonOfJerry: {
			mostSnowballsHit: userProfile.player_stats.winter?.most_snowballs_hit ?? 0,
			mostDamageDealt: userProfile.player_stats.winter?.most_damage_dealt ?? 0,
			mostMagma_damageDealt: userProfile.player_stats.winter?.most_magma_damage_dealt ?? 0,
			mostCannonballsHit: userProfile.player_stats.winter?.most_cannonballs_hit ?? 0
		},
		dragons: getDragons(userProfile),
		endstoneProtector: {
			kills: userProfile.player_stats.kills?.corrupted_protector ?? 0,
			deaths: userProfile.player_stats.deaths?.corrupted_protector ?? 0
		},
		damage: {
			highestCriticalDamage: userProfile.player_stats.highest_critical_damage ?? 0
		},
		petMilestones: {
			seaCreaturesKilled: getPetMilestone(
				'sea_creatures_killed',
				userProfile.player_stats.pets?.milestone?.sea_creatures_killed ?? 0
			),
			oresMined: getPetMilestone('ores_mined', userProfile.player_stats?.pets?.milestone.ores_mined ?? 0)
		},
		mythologicalEvent: userProfile.player_stats.mythos,
		effects: {
			active: userProfile.player_data?.active_effects || [],
			paused: userProfile.player_data?.paused_effects || [],
			disabled: userProfile.player_data?.disabled_potion_effects || []
		},
		profileUpgrades: getProfileUpgrades(profile),
		auctions: userProfile.player_stats.auctions,
		claimedItems: getClaimedItems(player),
		uncategorized: {
			soulflow: userProfile.item_data?.soulflow ?? 0,
			teleporter_pill_consumed: userProfile.item_data?.teleporter_pill_consumed ?? false,
			reaper_peppers_eaten: userProfile.player_data?.reaper_peppers_eaten ?? 0,
			personal_bank: constants.BANK_COOLDOWN[userProfile.profile?.personal_bank_upgrade ?? 0] ?? 'Unknown'
		}
	};
}
