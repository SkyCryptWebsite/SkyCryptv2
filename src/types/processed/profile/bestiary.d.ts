export type BestiaryStats = {
  categories: Record<string, BestiaryCategory>;
  milestone: number;
  maxMilestone: number;
  familiesUnlocked: number;
  totalFamilies: number;
  familiesMaxed: number;
};

export type BestiaryCategory = {
  name: string;
  texture: string;
  mobs: BestiaryMob[];
  mobsUnlocked: number;
  mobsMaxed: number;
};

export type BestiaryMob = {
  name: string;
  texture: string;
  kills: number;
  nextTierKills: number | null;
  maxKills: number;
  tier: number;
  maxTier: number;
};
