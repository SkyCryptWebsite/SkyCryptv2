export type CrimsonIsle = {
	factions: {
		selected_faction: string;
		barbarians_reputation: number;
		mages_reputation: number;
	};
	kuudra: {
		total_kils: number;
		tiers: {
			name: string;
			id: string;
			head: string;
			kills: number;
		}[];
	};
	dojo: {
		total_points: number;
		challenges: {
			name: string;
			id: string;
			texture: string;
			points: number;
			time: number;
			rank: string;
		}[];
	};
};
