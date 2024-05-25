export * from './processed/profile/main_stats';
export * from './processed/profile/skills';
export * from './processed/profile/rank';
export * from './processed/profile/items';
export * from './processed/profile/pets';
export * from './processed/profile/pet-stats';

import type { Skills } from '$types/processed/profile/skills';
import type { AccessoriesOutput } from './global';
import type { Rank } from './processed/profile/rank';

export type Stats = {
	username: string;
	uuid: string;
	profile_id: string;
	profile_cute_name: string;
	game_mode: string;
	selected: boolean;
	members: string[];
	skills: Skills;
	rank: Rank | undefined;
	skyblock_level: Skill;
	stats: MainStats;
	items: Items;
	accessories: AccessoriesOutput;
	pets: Pets,
};
