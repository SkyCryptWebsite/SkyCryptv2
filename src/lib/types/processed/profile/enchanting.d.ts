export type Enchanting = {
  unlocked: boolean;
  data: {
    [string: string]: ProcessedExperimentationGame;
  };
};

export type ProcessedExperimentationGame = {
  name: string;
  stats: {
    lastAttempt: number;
    lastClaimed: number;
    bonusClicks: number;
    games: {
      name: string;
      texture: string;
      attempts: number;
      claims: number;
      bestScore: number;
    }[];
  };
};
