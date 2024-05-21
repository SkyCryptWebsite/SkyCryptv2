import type { PlayerData } from './player_data';

export type Options = {
	cacheOnly: boolean;
};

export type ProfilesResponse = {
	success: boolean;
	cause?: string;
	profiles: Profile[];
};

export type Profile = {
	profile_id: string;
	cute_name: string;
	selected: boolean;
	game_mode: string;
	uuid: string;
	members: Record<string, Member>;
	banking: Banking;
};

export type Member = {
	player_data?: PlayerData;
	jacobs_contest?: JacobsContest;
	leveling?: Leveling;
	profile?: MemberProfile;
	currencies?: Currencies;
	fairy_soul?: FairySouls;
};

export type JacobsContest = {
	perks?: Record<string, number>;
};

export type Leveling = {
	experience: number;
};

export type MemberProfile = {
	first_join?: number;
	cookie_buff_active?: boolean;
};

export type Banking = {
	balance: number;
};

export type FairySouls = {
	total_collected: number;
};
