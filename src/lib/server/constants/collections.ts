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

export const BOSS_COLLECTIONS = [
  {
    name: "Bonzo",
    texture: "/api/head/12716ecbf5b8da00b05f316ec6af61e8bd02805b21eb8e440151468dc656549c",
    collections: [25, 50, 100, 150, 250, 1000]
  },
  {
    name: "Scarf",
    texture: "/api/head/7de7bbbdf22bfe17980d4e20687e386f11d59ee1db6f8b4762391b79a5ac532d",
    collections: [25, 50, 100, 150, 250, 1000]
  },
  {
    name: "The Professor",
    texture: "/api/head/9971cee8b833a62fc2a612f3503437fdf93cad692d216b8cf90bbb0538c47dd8",
    collections: [25, 50, 100, 150, 250, 1000]
  },
  {
    name: "Thorn",
    texture: "/api/head/8b6a72138d69fbbd2fea3fa251cabd87152e4f1c97e5f986bf685571db3cc0",
    collections: [50, 100, 150, 250, 400, 1000]
  },
  {
    name: "Livid",
    texture: "/api/head/c1007c5b7114abec734206d4fc613da4f3a0e99f71ff949cedadc99079135a0b",
    collections: [50, 100, 150, 250, 500, 750, 1000]
  },
  {
    name: "Sadan",
    texture: "/api/head/fa06cb0c471c1c9bc169af270cd466ea701946776056e472ecdaeb49f0f4a4dc",
    collections: [50, 100, 150, 250, 500, 750, 1000]
  },
  {
    name: "Necron",
    texture: "/api/head/a435164c05cea299a3f016bbbed05706ebb720dac912ce4351c2296626aecd9a",
    collections: [50, 100, 150, 250, 500, 750, 1000]
  },
  {
    name: "Kuudra",
    texture: "/api/head/82ee25414aa7efb4a2b4901c6e33e5eaa705a6ab212ebebfd6a4de984125c7a0",
    collections: [10, 100, 500, 2000, 5000]
  }
];
