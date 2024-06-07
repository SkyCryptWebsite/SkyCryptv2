export type MinionCategoryType = 'farming' | 'mining' | 'combat' | 'foraging' | 'fishing';

export type Minions = {
	minions: Record<MinionCategoryType, MinionCategory>;
	totalMinions: number;
	maxedMinions: number;
	totalTiers: number;
	maxedTiers: number;
	minionsSlots: {
		bonusSlots: number;
		current: number;
		next: number;
	};
};

export type MinionCategory = {
	minions: Minion[];
	totalMinions: number;
	maxedMinions: number;
	totalTiers: number;
	maxedTiers: number;
};

export type Minion = {
	name: string;
	texture: string;
	maxTier: number;
	tiers: number[];
};
