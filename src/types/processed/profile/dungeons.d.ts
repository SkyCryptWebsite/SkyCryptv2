export type DungeonsStats = {
	level: Skill;
	classes: {
		selectedClass: string;
		classes: Record<string, Skill>;
		classAverage: number;
		classAverageWithProgress: number;
		totalClassExp: number;
	};
	secrets: {
		found: number;
	};
	catacombs: CatacombsData[];
	master_catacombs: CatacombsData[];
};

export type CatacombsData = {
	name: string;
	texture: string;
	times_played: number;
	tier_completions: number;
	milestone_completions: number;
	best_score: number;
	mobs_killed: number;
	watcher_kills: number;
	most_mobs_killed: number;
	fastest_time: number;
	fastest_time_s: number;
	fastest_time_s_plus: number;
	most_healing: number;
	most_damage: {
		damage: number;
		type: string;
	};
	best_run: {
		grade: string;
		timestamp: number;
		score_exploration: number;
		score_speed: number;
		score_skill: number;
		score_bonus: number;
		dungeon_class: string;
		elapsed_time: number;
		damage_dealt: number;
		deaths: number;
		mobs_killed: number;
		secrets_found: number;
		damage_mitigated: number;
	};
};
