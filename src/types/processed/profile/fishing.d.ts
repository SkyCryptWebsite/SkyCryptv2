export type Fishing = {
  treasure: number;
  treasureLarge: number;
  shredderFished: number;
  shredderBait: number;
  trophyFishCaught: number;
  kills: { id: string; name: string; amount: number }[];
  trophyFish: TrophyFish[];
};

export type TrophyFish = {
  id: string;
  name: string;
  description: string;
  bronze: number;
  silver: number;
  gold: number;
  diamond: number;
  texture: string;
  maxed: boolean;
};
