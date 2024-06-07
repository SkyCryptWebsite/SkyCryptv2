export type Slayer = {
	data: Record<string, SlayerData>;
	stats: Record<string, number>;
	totalSlayerExp: number;
};

export type SlayerData = {
	name: string;
	texture: string;
	kills: Record<string, number>;
	level: {
		xp: number;
		xpForNext: number;
		level: number;
		maxLevel: number;
		maxed: boolean;
	};
};
