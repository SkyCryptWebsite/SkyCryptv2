export type Farming = {
	farming: Skill;
	uniqueGolds: number;
	pelts: number;
	medals: Record<string, number>;
	contests: Record<string, Contest>;
};

export type Contest = {
	name: string;
	collected: number;
	amount: number;
};
