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
  texture: string;
  collected: number;
  amount: number;
  medals: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
};
