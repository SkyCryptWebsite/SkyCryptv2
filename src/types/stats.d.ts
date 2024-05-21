export * from './processed/profile/main_stats';
export * from './processed/profile/skills';
export * from './processed/profile/rank';

import type { Skills } from '$types/processed/profile/skills';
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
};
