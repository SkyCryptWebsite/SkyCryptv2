export type Extra = {
	type: string;
	cap?: number;
};

export type Skill = {
	xp: number;
	level: number;
	maxLevel: number;
	xpCurrent: number;
	xpForNext: number;
	progress: number;
	levelCap: number;
	uncappedLevel: number;
	levelWithProgress: number;
	unlockableLevelWithProgress: number;
};
