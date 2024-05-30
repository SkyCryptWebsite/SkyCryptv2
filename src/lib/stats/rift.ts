import * as constants from '$constants/constants';
import type { Member } from '$types/global';

function getTimecharms(userProfile: Member) {
	const output = [];
	for (const timecharm of constants.RIFT_TIMECHARMS) {
		const charmData = userProfile.rift?.gallery?.secured_trophies?.find((a) => a.type === timecharm.id);

		output.push({
			name: timecharm.name,
			id: timecharm.id,
			texture: timecharm.texture,
			unlocked: charmData !== undefined,
			unlocked_at: charmData?.timestamp ?? null
		});
	}

	return {
		timecharms_found: output.filter((a) => a.unlocked).length,
		timecharms: output
	};
}

function getPorhtals(userProfile: Member) {
	const output = [];
	for (const [key, porhtal] of constants.RIFT_EYES.entries()) {
		const porhtalData =
			userProfile.rift?.wither_cage?.killed_eyes && userProfile.rift?.wither_cage.killed_eyes[key] !== undefined;

		output.push({
			name: porhtal.name,
			texture: porhtal.texture,
			unlocked: porhtalData ?? false
		});
	}

	return {
		porhtals_found: output.filter((a) => a.unlocked).length,
		porhtals: output
	};
}

export function getRift(userProfile: Member) {
	return {
		motes: {
			purse: userProfile.currencies?.motes_purse ?? 0,
			lifetime: userProfile.player_stats?.rift?.lifetime_motes_earned ?? 0,
			orbs: userProfile.player_stats?.rift?.motes_orb_pickup ?? 0
		},
		enigma: {
			souls: userProfile.rift?.enigma?.found_souls?.length ?? 0,
			total_souls: constants.RIFT_ENIGMA_SOULS
		},
		castle: {
			grubber_stacks: userProfile.rift?.castle?.grubber_stacks ?? 0,
			max_burgers: constants.MAX_GRUBBER_STACKS
		},
		porhtal: getPorhtals(userProfile),
		timecharms: getTimecharms(userProfile)
	};
}
