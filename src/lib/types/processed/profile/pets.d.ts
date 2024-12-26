import type { ProcessedSkyblockPet } from "./items";
import type { PetStatsExtra } from "./pet-stats";
import type { ItemStats } from "./stats";

export type Pet = {
  type: string;
  active: boolean;
  exp: number;
  tier: string;
  candyUsed: number;
  heldItem: string | null;
  skin: string | null;
  uuid: string;
  rarity: string;
  maxTier: string;
  ignoresTierBoost: boolean | undefined;
  level: {
    level: number;
    progress: number;
    xpCurrent: number;
    xpForNext: number;
    xpMaxLevel: number;
  };
  stats: ItemStats;
  texture_path: string;
  extra: PetStatsExtra;
  price: number;
  tag?: {
    display?: {
      Lore?: string[];
    };
  };
  display_name: string;
  emoji: string;
};

export type MissingPet = {
  type: string;
  active: boolean;
  exp: number;
  tier: string;
  candyUsed: number;
  heldItem: string | null;
  skin: string | null;
  uuid: string;
};

export type petData = {
  head:
    | string
    | {
        default: string;
        [key: string]: string | undefined;
      };
  name?: { default: string; [rarity: string]: string };
  type: string;
  maxTier: string;
  maxLevel: number;
  emoji: string;
  category?: string;
  passivePerks?: boolean;
  bingoExclusive?: boolean;
  obtainsExp?: "feed";
  customLevelExpRarityOffset?: string;
  ignoresTierBoost?: boolean;
  alwaysGainsExp?: boolean | string;
  typeGroup?: string;
  hatching?: {
    level: number;
    name: string;
    head: string;
  };
  upgrades?: Record<string, { head: string }>;
  subLore?: string;
  ignoredInPetScoreCalculation?: boolean;
};

export type PetSkin = {
  name: string;
  texture: string;
  source: string;
  release: number;
};

export type Pets = {
  pets: ProcessedSkyblockPet[];
  missing: ProcessedSkyblockPet[];
  amount: number;
  total: number;
  amountSkins: number;
  totalSkins: number;
  totalPetExp: number;
  totalCandyUsed: number;
  petScore?: {
    amount: number;
    stats: Record<string, number>;
    reward: {
      score: number;
      bonus: number;
      unlocked?: boolean;
    }[];
  };
};

export type PetDataAbility = {
  abilities: {
    name: string;
    desc: string;
  }[];
};

export type ProcessedPet = {
  type: string;
  display_name: string;
  rarity: string;
  active: boolean;
  price: number;
  level: {
    xp: number;
    level: number;
    xpMaxLevel: number;
    currentXp: number;
    progress: number;
    xpForNext: number;
  };
  texture_path: string;
  lore: string[];
  stats: Record<string, number>;
  candyUsed: number;
  skin: string | null;
};
