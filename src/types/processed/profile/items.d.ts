export type Item = {
	id: number;
	damage: number;
	Count: number;
	tag: {
		ExtraAttributes: {
			id?: string;
			enchantments: Record<string, number>;
		};
		display?: {
			Name: string;
		};
		SkullOwner: {
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
	id?: number;
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
	texture?: string;
};

export type ProcessedItem = {
	id: number;
	damage: number;
	Count: number;
	tag: {
		display?: {
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
			donated_museum: boolean;
			timestamp: number;
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
	armor: Item[];
};
