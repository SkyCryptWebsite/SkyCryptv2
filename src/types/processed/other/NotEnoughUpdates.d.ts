export type NEUItem = {
	itemid: string;
	displayname: string;
	damage: number;
	lore: string[];
	internalname: string;
	nbttag: {
		SkullOwner: {
			Id: string;
			Properties: {
				textures: {
					Value: string;
				}[];
			};
		};
		display: {
			Name: string;
			Lore: string[];
		};
	};
};

export type NEUConstants = {
	pets: Record<
		string,
		{
			[key: string]: {
				otherNums: number[];
				statNums: Record<string, number>;
			};
		}
	>;
};
