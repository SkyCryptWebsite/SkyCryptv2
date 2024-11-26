export type Farming = {
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
  weight: {
    totalWeight: number;
    bonusWeight: number;
    cropsWeight: number;
    bonusSources: Record<string, number>;
    crops: { name: string; id: string; amount: number }[];
  };
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
