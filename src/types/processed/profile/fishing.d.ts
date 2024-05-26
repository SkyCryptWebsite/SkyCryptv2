export type Fishing = {
	treasure: number;
	treasure_large: number;
	shredder_fished: number;
	shredder_bait: number;
	trophy_fish_caught: number;
	kills: { id: string; name: string; amount: number }[];
	trophy_fish: TrophyFish[];
};

export type TrophyFish = {
	id: string;
	name: string;
	description: string;
	bronze: number;
	silver: number;
	gold: number;
	diamond: number;
	texture: string;
	maxed: boolean;
};
