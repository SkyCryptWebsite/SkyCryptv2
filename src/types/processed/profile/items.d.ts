export type Item = {
	id: number;
	damage: number;
	Count: number;
	tag: {
		ExtraAttributes: {
			id?: string;
		};
		display?: {
			Name: string;
		};
	};
	texture?: string;
	texture_path?: string;
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
