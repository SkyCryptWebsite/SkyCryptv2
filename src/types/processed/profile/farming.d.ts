export type Farming = {
  farming: Skill;
  uniqueGolds: number;
  pelts: number;
  medals: Record<
    string,
    {
      amount: number;
      total: number;
    }
  >;
  contestsAttended: number;
  contests: Record<string, Contest>;
};

export type Contest = {
  name: string;
  collected: number;
  amount: number;
};
