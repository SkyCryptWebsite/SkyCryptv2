export type Collection = {
  name: string;
  items: {
    id: string;
    name: string;
    texture: string;
    maxTier: number;
    tiers: {
      tier: number;
      amountRequired: number;
      unlocks: string[];
    }[];
  }[];
};

export const COLLECTION_ICONS = {
  farming: "GOLDEN_HOE",
  mining: "STONE_PICKAXE",
  combat: "STONE_SWORD",
  foraging: "JUNGLE_SAPLING",
  fishing: "FISHING_ROD",
  rift: "MYCELIUM"
} as Record<string, string>;
