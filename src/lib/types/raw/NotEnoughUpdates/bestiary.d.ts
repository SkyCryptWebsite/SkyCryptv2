export type NotEnoughUpdatesBestiary = {
  brackets: Record<string, number[]>;
  [key: Island]: IslandData;
};

type Island = "dynamic" | "hub" | "farming_1" | "combat_1" | "combat_3" | "crimson_isle" | "mining_2" | "mining_3" | "crystal_hollows" | "foraging_1" | "spooky_festival" | "mythological_creatures" | "jerry" | "kuudra" | "fishing" | "catacombs" | "garden";

type IslandData = {
  name: string;
  icon: {
    skullOwner: string;
    texture: string;
    item: string;
  };
  mobs: Mob[];
  hasSubcategories: boolean;
  [key: string]: Mob[];
};

type Mob = {
  name: string;
  item?: string;
  skullOwner?: string;
  texture?: string;
  cap: number;
  mobs: string[];
  bracket: number;
};
