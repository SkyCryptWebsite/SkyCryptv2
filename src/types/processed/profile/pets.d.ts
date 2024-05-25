import type { PetStatsExtra } from './pet-stats';
import type { ItemStats } from './stats';

export type Pet = {
	type: string;
	active: boolean;
	exp: number;
	tier: string;
	candyUsed: number;
	heldItem: string | null;
	skin: string | null;
	uuid: string;
	rarity: string;
	maxTier: string;
	ignoresTierBoost: boolean | undefined;
	level: {
		level: number;
		progress: number;
		xpCurrent: number;
		xpForNext: number;
		xpMaxLevel: number;
	};
	stats: ItemStats;
	texture_path: string;
	extra: PetStatsExtra;
	price: number;
	tag?: {
		display?: {
			Lore?: string[];
		};
	};
	display_name: string;
	emoji: string;
};

export type MissingPet = {
	type: string;
	active: boolean;
	exp: number;
	tier: string;
	candyUsed: number;
	heldItem: string | null;
	skin: string | null;
	uuid: string;
};

export type petData = {
	head:
		| string
		| {
				default: string;
				[key: string]: string | undefined;
		  };
	name?: { default: string; [rarity: string]: string };
	type: string;
	maxTier: string;
	maxLevel: number;
	emoji: string;
	category?: string;
	passivePerks?: boolean;
	bingoExclusive?: boolean;
	obtainsExp?: 'feed';
	customLevelExpRarityOffset?: string;
	ignoresTierBoost?: boolean;
	alwaysGainsExp?: boolean | string;
	typeGroup?: string;
	hatching?: {
		level: number;
		name: string;
		head: string;
	};
	upgrades?: Record<string, { head: string }>;
	subLore?: string;
	ignoredInPetScoreCalculation?: boolean;
};

export type PetSkin = {
	name: string;
	texture: string;
	source: string;
	release: number;
};

export type Pets = {
	pets: Pet[];
	missing: MissingPet[];
	amount: number;
	total: number;
	amount_skins: number;
	total_skins: number;
	total_pet_xp: number;
	total_candy_used: number;
	pet_score: {
		amount: number;
		total: number;
		bonus: Record<string, number>;
	};
};

export type PetDataAbility = {
	abilities: {
		name: string;
		desc: string;
	}[];
};
