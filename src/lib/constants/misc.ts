export const FAIRY_SOULS = {
	normal: 247,
	stranded: 4
} as Record<string, number>;

export const ESSENCE = {
	ice: {
		name: 'Ice',
		texture: '/head/ddba642efffa13ec3730eafc5914ab68115c1f998803f74452e2e0cd26af0b8'
	},
	wither: {
		name: 'Wither',
		texture: '/head/c4db4adfa9bf48ff5d41707ae34ea78bd2371659fcd8cd8934749af4cce9b'
	},
	spider: {
		name: 'Spider',
		texture: '/head/16617131250e578333a441fdf4a5b8c62163640a9d06cd67db89031d03accf6'
	},
	undead: {
		name: 'Undead',
		texture: '/head/71d7c816fc8c636d7f50a93a0ba7aaeff06c96a561645e9eb1bef391655c531'
	},
	diamond: {
		name: 'Diamond',
		texture: '/head/964f25cfff754f287a9838d8efe03998073c22df7a9d3025c425e3ed7ff52c20'
	},
	dragon: {
		name: 'Dragon',
		texture: '/head/33ff416aa8bec1665b92701fbe68a4effff3d06ed9147454fa77712dd6079b33'
	},
	gold: {
		name: 'Gold',
		texture: '/head/8816606260779b23ed15f87c56c932240db745f86f683d1f4deb83a4a125fa7b'
	},
	crimson: {
		name: 'Crimson',
		texture: '/head/67c41930f8ff0f2b0430e169ae5f38e984df1244215705c6f173862844543e9d'
	}
} as Record<string, { name: string; texture: string }>;

export const RACE_NAMES = {
	crystal_core: 'Crystal Core',
	giant_mushroom: 'Giant Mushroom',
	precursor_ruins: 'Precursor Ruins',
	foraging_race: 'Foraging',
	end_race: 'End',
	chicken_race_2: 'Chicken',
	rift_race: 'Rift'
} as Record<string, string>;

export const MILESTONE_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const PET_MILESTONES = {
	sea_creatures_killed: [250, 1000, 2500, 5000, 10000],
	ores_mined: [2500, 7500, 20000, 100000, 250000]
} as Record<string, number[]>;

export const PROFILE_UPGRADES = {
	island_size: 10,
	minion_slots: 5,
	guests_count: 5,
	coop_slots: 3,
	coins_allowance: 5
} as Record<string, number>;

export const CLAIMABLE_ITEMS = {
	claimed_potato_talisman: 'Potato Talisman',
	claimed_potato_basket: 'Potato Basket',
	claim_potato_war_silver_medal: 'Silver Medal (Potato War)',
	claim_potato_war_crown: 'Crown (Potato War)',
	skyblock_free_cookie: 'Free Booster Cookie'
};

export const BANK_COOLDOWN = {
	1: '20 minutes',
	2: '5 minutes',
	3: 'None'
} as Record<number, string>;
