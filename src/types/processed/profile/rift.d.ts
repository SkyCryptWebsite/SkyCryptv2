export type Rift = {
	motes: {
		purse: number;
		lifetime: number;
		orbs: number;
	};
	enigma: {
		souls: number;
		total_souls: number;
	};
	castle: {
		grubber_stacks: number;
		max_burgers: number;
	};
	porhtal: {
		porhtals_found: number;
		porhtals: {
			name: string;
			texture: string;
			unlocked: boolean;
		}[];
	};
	timecharms: {
		timecharms_found: number;
		timecharms: {
			name: string;
			id: string;
			texture: string;
			unlocked: boolean;
			unlocked_at: number | null;
		}[];
	};
};
