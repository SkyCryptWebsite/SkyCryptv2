import type { Stats, Profile } from '$types/global';
import * as stats from '$lib/stats/stats';
import type { Player } from '$types/raw/player/lib';

export async function getStats(profile: Profile, player: Player): Promise<Stats> {
	const userProfile = profile.members[profile.uuid];

	return {
		skills: stats.getSkills(userProfile, profile, player)
	};
}
