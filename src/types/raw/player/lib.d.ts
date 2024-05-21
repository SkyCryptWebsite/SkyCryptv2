export type PlayerResponse = {
	success: boolean;
	cause?: string;
	player: Player;
};

export type Player = {
	achievements: Achievements;
	newPackageRank?: string;
};

export type Achievements = {
	[key?: string]: number;
};
