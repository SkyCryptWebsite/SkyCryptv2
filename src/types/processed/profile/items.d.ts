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