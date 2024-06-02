export type NEUItem = {
	itemid: string;
	displayname: string;
	damage: number;
	lore: string[];
	internalname: string;
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
