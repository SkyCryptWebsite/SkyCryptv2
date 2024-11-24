export type NotEnoughUpdatesBestiaryConstants = {
  brackets: Record<string, number[]>;
  islands: Record<string, Island>;
};

type Island = {
  name: string;
  mobs: Mob[];
};

type Mob = {
  name: string;
  cap: number;
  mobs: string[];
  bracket: number;
};
