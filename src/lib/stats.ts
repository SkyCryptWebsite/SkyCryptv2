import type { Stats, Profile } from '$types/global';
import * as stats from '$lib/stats/stats';
import type { Player } from '$types/raw/player/lib';

export async function getStats(profile: Profile, player: Player): Promise<Stats> {
	const userProfile = profile.members[profile.uuid];

	const items = await stats.getItems(userProfile);
	return {
		username: player.displayname,
		uuid: profile.uuid,
		profile_id: profile.profile_id,
		profile_cute_name: profile.cute_name,
		game_mode: profile.game_mode,
		selected: profile.selected,
		members: Object.keys(profile.members).filter((uuid) => uuid !== profile.uuid),
		rank: stats.getRank(player),
		skills: stats.getSkills(userProfile, profile, player),
		skyblock_level: stats.getSkyblockLevel(userProfile),
		stats: stats.getMainStats(userProfile, profile),
		items: items,
		accessories: await stats.getAccessories(
			userProfile,
			items.armor.armor,
			items.talisman_bag,
			items.inventory,
			items.enderchest,
			Object.values(items.backpack)
				.map((i) => i.containsItems ?? [])
				.flat()
		),
		pets: await stats.getPets(userProfile, items.pets, profile),
		mining: stats.getMining(userProfile, player),
		farming: stats.getFarming(userProfile),
		fishing: stats.getFishing(userProfile)
	};
}
