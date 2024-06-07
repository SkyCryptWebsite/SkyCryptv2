export type Misc = {
	essence: {
		name: string;
		id: string;
		texture: string;
		amount: number;
	}[];
	kills: {
		totalKills: number;
		totalDeaths: number;
		kills: { id: string; name: string; amount: number }[];
		death: { id: string; name: string; amount: number }[];
		races: {
			other: {
				name: string;
				races: Record<string, { name: string; time: number }>;
			};
			[string: string]: {
				name: string;
				races: {
					with_return: {
						[string: string]: { name: string; time: number };
					};
					no_return: {
						[string: string]: { name: string; time: number };
					};
				};
			};
		};
	};
	gifts: {
		given: number;
		received: number;
	};
	seasonOfJerry: {
		mostSnowballsHit: number;
		mostDamageDealt: number;
		mostMagma_damageDealt: number;
		mostCannonballsHit: number;
	};
	dragons: {
		enderCrystalsYestroyed: number;
		mostDamage: Record<string, number>;
		fastestKill: Record<string, number>;
		kills: Record<string, number>;
		deaths: Record<string, number>;
	};
	endstoneProtector: {
		kills: number;
		deaths: number;
	};
	damage: {
		highestCriticalDamage: number;
	};
	petMilestones: {
		seaCreaturesKilled: {
			amount: number;
			rarity: string;
			total: number;
			progress: string;
		};
		oresMined: {
			amount: number;
			rarity: string;
			total: number;
			progress: string;
		};
	};
	mythologicalEvent: {
		kills: number;
		burrows_dug_next: {
			total: number;
			[burrow: string]: number;
		};
		burrows_dug_combat: {
			total: number;
			[burrow: string]: number;
		};
		burrows_dug_treasure: {
			total: number;
			[burrow: string]: number;
		};
		burrows_chains_complete: {
			total: number;
			[burrow: string]: number;
		};
	};
	effects: {
		active: string[];
		paused: string[];
		disabled: string[];
	};
	profileUpgrades: {
		island_size: number;
		minion_slots: number;
		guests_count: number;
		coop_slots: number;
		coins_allowance: number;
	};
	auctions: {
		bids: number;
		highest_bid: number;
		won: number;
		total_bought: Record<string, number>;
		gold_spent: number;
		created: number;
		fees: number;
		completed: number;
		total_sold: Record<string, number>;
		gold_earned: number;
		no_bids: number;
	};
	claimedItems: {
		[key: string]: number;
	};
	uncategorized: {
		[key: string]: number | string;
	};
};
