export type Collections = {
	categories: Record<string, CollectionCategory>;
	totalCollections: number;
	maxedCollections: number;
};

export type CollectionCategory = {
	name: string;
	texture: string;
	items: CategoryItem[];
	totalTiers: number;
	maxTiers: number;
};

export type CategoryItem = {
	name: string;
	id: string;
	texture: string;
	amount: number;
	totalAmount: number;
	tier: number;
	maxTier: number;
	amounts: { username: string; amount: number }[];
};
