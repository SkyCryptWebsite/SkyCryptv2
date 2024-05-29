export type Collections = {
	categories: Record<string, CollectionCategory>;
	total_collections: number;
	maxed_collections: number;
};

export type CollectionCategory = {
	name: string;
	texture: string;
	items: CategoryItem[];
	total_tiers: number;
	max_tiers: number;
};

export type CategoryItem = {
	name: string;
	id: string;
	texture: string;
	amount: number;
	total_amount: number;
	tier: number;
	max_tier: number;
	amounts: { username: string; amount: number }[];
};
