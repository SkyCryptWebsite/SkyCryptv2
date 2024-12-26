import type { DatabaseItem } from "$types/global";

export const ITEMS = new Map<string, DatabaseItem>();

export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "divine", "supreme", "special", "very_special", "admin"];

export const RARITY_COLORS = {
  common: "f",
  uncommon: "a",
  rare: "9",
  epic: "5",
  legendary: "6",
  mythic: "d",
  divine: "b",
  supreme: "4",
  special: "c",
  very_special: "c",
  admin: "4",
  ultimate: "4"
} as Record<string, string>;

export const POTION_COLORS = {
  0: "375cc4", // None
  1: "cb5ba9", // Regeneration
  2: "420a09", // Speed
  3: "e19839", // Poison
  4: "4d9130", // Fire Resistance
  5: "f52423", // Instant Health
  6: "1f1f9e", // Night Vision
  7: "22fc4b", // Jump Boost
  8: "474c47", // Weakness
  9: "912423", // Strength
  10: "5c6e83", // Slowness
  11: "f500f5", // Uncraftable
  12: "420a09", // Instant Damage
  13: "2f549c", // Water Breathing
  14: "818595", // Invisibility
  15: "f500f5" // Uncraftable
} as Record<string, string>;

export const TYPE_TO_CATEGORIES = {
  helmet: ["armor", "helmet"],
  chestplate: ["armor", "chestplate"],
  leggings: ["armor", "leggings"],
  boots: ["armor", "boots"],
  sword: ["weapon", "sword"],
  bow: ["weapon", "bow"],
  longsword: ["weapon", "longsword", "sword"],
  wand: ["weapon", "wand"],
  hatccessory: ["armor", "helmet", "accessory", "hatccessory"],
  gauntlet: ["weapon", "mining_tool", "tool", "gauntlet"],
  pickaxe: ["mining_tool", "tool", "pickaxe"],
  drill: ["mining_tool", "tool", "drill"],
  axe: ["foraging_tool", "tool", "axe"],
  hoe: ["farming_tool", "tool", "hoe"],
  "fishing rod": ["fishing_tool", "tool"],
  "fishing weapon": ["fishing_tool", "tool", "weapon"],
  shovel: ["tool", "shovel"],
  shears: ["tool", "shears"],
  bait: ["bait"],
  item: ["item"],
  accessory: ["accessory"],
  arrow: ["arrow"],
  "reforge stone": ["reforge_stone"],
  cosmetic: ["cosmetic"],
  "pet item": ["pet_item"],
  "travel scroll": ["travel_scroll"],
  belt: ["belt"],
  cloak: ["cloak"],
  necklace: ["necklace"],
  gloves: ["gloves"],
  bracelet: ["bracelet"],
  deployable: ["deployable"],
  "trophy fish": ["trophy_fish"]
};

export const ENCHANTMENTS_TO_CATEGORIES = {
  farming_tool: ["cultivating", "dedication", "delicate", "harvesting", "replenish", "sunder", "turbo_cacti", "turbo_cane", "turbo_carrot", "turbo_coco", "turbo_mushrooms", "turbo_potato", "turbo_warts", "turbo_wheat"]
};

export const ENCHANTMENT_LADDERS = {
  // Number of S runs required for each level of hecatomb
  hecatomb_s_runs: {
    name: "Hecatomb Runs",
    ladder: [2, 5, 10, 20, 30, 40, 60, 80, 100]
  },
  // Number of xp required for each level of champion
  champion_combat_xp: {
    name: "Champion XP",
    ladder: [50000, 100000, 250000, 500000, 1000000, 1500000, 2000000, 2500000, 3000000]
  },
  // Number of crops harvested for each level of cultivating crops
  farmed_cultivating: {
    name: "Cultivating Crops",
    ladder: [1000, 5000, 25000, 100000, 300000, 1500000, 5000000, 20000000, 100000000]
  },
  // Number of kills required for each level of expertise
  expertise_kills: {
    name: "Expertise Kills",
    ladder: [50, 100, 250, 500, 1000, 2500, 5500, 10000, 15000]
  },
  // Number of ores mined required for each level of compact ores
  compact_blocks: {
    name: "Ores Mined",
    ladder: [100, 500, 1500, 5000, 15000, 50000, 150000, 500000, 1000000]
  }
};
