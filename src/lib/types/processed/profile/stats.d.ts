export type StatsData = {
  [key: string]: {
    name: string;
    nameLore: string;
    nameShort: string;
    nameTiny: string;
    symbol: string;
    suffix: string;
    color: string;
  };
};

export type ItemStats = {
  [key in StatName]?: number;
};
