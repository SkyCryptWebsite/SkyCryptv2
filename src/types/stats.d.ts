export * from '$types/processed/profile/skills';

export type Stats = {
	username: string;
	uuid: string;
	profile_id: string;
	profile_cute_name: string;
	game_mode: string;
	selected: boolean;
	members: string[];
	skills: Skills;
	rank: Rank;
	skyblock_level: Skill;
};
