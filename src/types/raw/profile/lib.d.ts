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
};

export type Member = {
	player_data?: PlayerData;
	jacobs_contest?: JacobsContest;
};

export type JacobsContest = {
	perks?: Record<string, number>;
};
