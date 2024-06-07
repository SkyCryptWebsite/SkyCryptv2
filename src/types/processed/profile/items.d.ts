import type { ItemStats } from './stats';

export type Item = {
	id: number;
	damage: number;
	Count: number;
	tag: {
		ExtraAttributes: {
			id?: string;
			enchantments?: Record<string, number>;
		};
		display?: {
			Name: string;
		};
		SkullOwner?: {
			Properties: {
				textures: {
					Value: string;
				}[];
			};
		};
	};
	texture?: string;
	texture_path?: string;
	material?: string;
	itemId?: string;
};

export type DatabaseItem = {
	material?: string;
	skin?: string;
	name?: string;
	category?: string;
	tier?: string;
	id: string;
	item_id?: number;
	skyblock_id?: string;
	color?: string;
	damage?: number;
};

export type ItemQuery = {
	skyblockId?: string;
	name?: string;
	item_id?: number;
	id?: number;
	damage?: number;
	pack?: string[];
	texture: string;
	texture_path: string;
};

export type ProcessedItem = {
	id: number;
	damage: number;
	Count: number;
	tag: {
		display: {
			Lore: string[];
			Name: string;
		};
		ExtraAttributes: {
			rarity_upgrades?: number;
			hot_potato_count?: number;
			color?: string;
			modifier?: string;
			dungeon_item_level?: number;
			id?: string;
			enchantments?: Record<string, number>;
			uuid?: string;
			donated_museum?: boolean;
			timestamp?: number;
			petInfo: {
				uuuid: string;
				type: string;
				exp: number;
				active: boolean;
				tier: number;
				heldItem: string | null;
				candyUsed: number;
				skin: string | null;
			};
			talisman_enrichment?: string;
		};
		SkullOwner: {
			Properties: {
				textures: {
					Value: string;
				}[];
			};
		};
	};
	extra: {
		hpbs?: number;
		recombobulated?: boolean;
		timestamp?: number;
		reforge?: string;
		source?: string;
		model?: string;
		enrichment?: string;
		price?: number;
	};
	texture_path: string;
	display_name: string;
	rarity: string;
	recombobulated?: boolean;
	dungeon?: boolean;
	shiny?: boolean;
	inBackpack?: boolean;
	item_index: number;
	containsItems?: ProcessedItem[];
	armor_name?: string;
	categories?: string[];
	backpackIndex?: number;
	hidden?: boolean;
	isInactive?: boolean;
	isUnique?: boolean;
	name?: string;
	tier?: string;
	item_id?: number;
	damage?: number;
	glowing?: boolean;
	position?: number;
	itemId: string;
	item_index: number;
};

export type getTextureParams = {
	pack_ids?: string[];
	hotm?: boolean;
};

export type GemTier = {
	quality: number;
};

export type Gemstone = {
	slot_type: string;
	slot_number: number;
	gem_type: string;
	gem_tier: string | number;
	lore: string;
};

export type Items = {
	armor: {
		armor: ProcessedItem[];
		stats: ItemStats;
		set_name?: string;
		set_rarity?: string;
	};
	talisman_bag: ProcessedItem[];
	personal_vault: ProcessedItem[];
	inventory: ProcessedItem[];
	enderchest: ProcessedItem[];
	backpack: Record<string, ProcessedItem>;
	equipment: {
		equipment: ProcessedItem[];
		stats: ItemStats;
	};
	wardrobe: ProcessedItem[];
	weapons: ProcessedItem[];
	farming_tools: ProcessedItem[];
	mining_tools: ProcessedItem[];
	fishing_tools: ProcessedItem[];
	pets: ProcessedItem[];
	fishing_bag: ProcessedItem[];
	potion_bag: ProcessedItem[];
	// candy_inventory: ProcessedItem[];
};

export type SpecialAccessory = {
	id: string;
	rarity: string;
	allowsRecomb?: boolean;
	allowsEnrichment?: boolean;
	rarities?: string[];
	customPrice?: boolean;
	upgrade?: {
		item: string;
		cost: Record<string, number>;
	};
};

export type Accessory = {
	id: string;
	rarity: string;
	name: string;
};

export type AccessoryRarities = {
	common: number;
	uncommon: number;
	rare: number;
	epic: number;
	legendary: number;
	mythic: number;
	special: number;
	very_special: number;
	abicase: {
		model: string;
	};
	rift_prism: boolean;
};

export type Accessories = {
	accessories: ProcessedItem[];
	accessory_ids: { id: string; rarity: string }[];
	accessory_rarities: Partial<AccessoryRarities>;
};

export type allAccessories = {
	id: string;
	texture_path?: string;
	rarity?: string;
	item_id?: number;
	damage?: number;
	texture?: string;
	material?: string;
};

export type AccessoriesOutput = {
	accessories: ProcessedItem[];
	missing: ProcessedItem[];
	upgrades: ProcessedItem[];
	stats: ItemStats;
	enrichments: Record<string, number>;
	unique: number;
	total: number;
	recombobulated: number;
	total_recombobulated: number;
	magical_power: {
		total: number;
		accessories: number;
		abiphone: number;
		rift_prism: number;
		rarities: Record<string, { amount: number; magical_power: number }>;
	};
};
