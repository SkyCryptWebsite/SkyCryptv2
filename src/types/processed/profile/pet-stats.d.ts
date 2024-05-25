import type { Member } from '$types/global';

export type PetStatsPet = {
	rarity: string;
	level: number;
	profile: Member;
};

export type PetStatsExtra = {
	blaze_kills: number;
};

export type PetItem = {
	name: string;
	tier: string;
	description: string;
	stats?: Record<string, number>;
	statsPerLevel?: Record<string, number>;
	multStats?: Record<string, number>;
	multAllStats?: number;
};
