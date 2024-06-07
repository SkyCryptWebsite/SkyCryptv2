export type Rift = {
	motes: {
		purse: number;
		lifetime: number;
		orbs: number;
	};
	enigma: {
		souls: number;
		totalSouls: number;
	};
	castle: {
		grubberStacks: number;
		maxBurgers: number;
	};
	porhtal: {
		porhtalsFound: number;
		porhtals: {
			name: string;
			texture: string;
			unlocked: boolean;
		}[];
	};
	timecharms: {
		timecharmsFound: number;
		timecharms: {
			name: string;
			id: string;
			texture: string;
			unlocked: boolean;
			unlockedAt: number | null;
		}[];
	};
};
