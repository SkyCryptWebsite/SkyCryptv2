export type SlayerData = {
  unlocked: boolean;
  data: Record<string, SlayerInfo>;
  stats: Record<string, number>;
  totalSlayerExp: number;
};

export type SlayerInfo = {
  name: string;
  texture: string;
  kills: Record<string, number>;
  level: {
    xp: number;
    xpForNext: number;
    level: number;
    maxLevel: number;
    maxed: boolean;
  };
};
