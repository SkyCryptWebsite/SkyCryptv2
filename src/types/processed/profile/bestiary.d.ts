export type BestiaryStats = {
  level: number;
  maxLevel: number;
  familiesUnlocked: number;
  familiesCompleted: number;
  totalFamilies: number;
  familyTiers: number;
  maxFamilyTiers: number;
  categories: Record<string, BestiaryCategory>;
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
