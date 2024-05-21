import type { Stats, Profile } from '$types/global';
import * as stats from '$lib/stats/stats';

export async function getStats(profile: Profile): Promise<Stats> {
	const userProfile = profile.members[profile.uuid];

	return {
		skills: stats.getSkills(userProfile, profile)
	};
}
