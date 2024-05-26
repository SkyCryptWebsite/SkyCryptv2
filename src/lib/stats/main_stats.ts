import { FAIRY_SOULS } from '../constants/constants';
import type { Profile, Member } from '$types/global';

export function getMainStats(userProfile: Member, profile: Profile) {
	return {
		joined: userProfile.profile?.first_join ?? 0,
		cookie_buff_active: userProfile.profile?.cookie_buff_active ?? false,
		purse: userProfile.currencies?.coin_purse ?? 0,
		bank: profile.banking?.balance ?? 0,
		fairy_souls: {
			found: userProfile.fairy_soul?.total_collected ?? 0,
			total: FAIRY_SOULS[profile.game_mode ?? 'normal'] ?? 0
		}
	};
}
