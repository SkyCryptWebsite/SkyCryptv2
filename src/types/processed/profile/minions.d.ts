export type MinionCategoryType = 'farming' | 'mining' | 'combat' | 'foraging' | 'fishing';

export type Minions = {
	minions: Record<MinionCategoryType, MinionCategory>;
	total_minions: number;
	maxed_minions: number;
	total_tiers: number;
	maxed_tiers: number;
	minions_slots: {
		bonus_slots: number;
		current: number;
		next: number;
	};
};

export type MinionCategory = {
	minions: Minion[];
	total_minions: number;
	maxed_minions: number;
	total_tiers: number;
	maxed_tiers: number;
};

export type Minion = {
	name: string;
	texture: string;
	maxTier: number;
	tiers: number[];
};
