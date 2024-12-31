export type Misc = {
  essence: {
    name: string;
    id: string;
    texture: string;
    amount: number;
  }[];
  kills: {
    total_kills: number;
    total_deaths: number;
    kills: { id: string; name: string; amount: number }[];
    deaths: { id: string; name: string; amount: number }[];
  };
  races: {
    [id: string]: {
      name: string;
      races: Record<
        string,
        | { name: string; time: number }
        | {
            with_return: Record<string, { name: string; time: number }> | null;
            no_return: Record<string, { name: string; time: number }> | null;
          }
        | null
      >;
    };
  };
  gifts: {
    given: number;
    received: number;
  };
  season_of_jerry: {
    most_snowballs_hit: number;
    most_damage_dealt: number;
    most_magma_damage_dealt: number;
    most_cannonballs_hit: number;
  };
  dragons?: {
    ender_crystals_destroyed: number;
    most_damage: Record<string, number>;
    fastest_kill: Record<string, number>;
    last_hits: Record<string, number>;
    deaths: Record<string, number>;
  };
  endstone_protector: {
    kills: number;
    deaths: number;
  };
  damage: {
    highest_critical_damage: number;
  };
  pet_milestones: {
    sea_creatures_killed: {
      amount: number;
      rarity: string;
      total: number;
      progress: string;
    };
    ores_mined: {
      amount: number;
      rarity: string;
      total: number;
      progress: string;
    };
  };
  mythological_event: {
    kills: number;
    burrows_dug_next: {
      total: number;
      [burrow: string]: number;
    };
    burrows_dug_combat: {
      total: number;
      [burrow: string]: number;
    };
    burrows_dug_treasure: {
      total: number;
      [burrow: string]: number;
    };
    burrows_chains_complete: {
      total: number;
      [burrow: string]: number;
    };
  };
  effects: {
    active: string[];
    paused: string[];
    disabled: string[];
  };
  profile_upgrades: Record<string, number>;
  auctions: {
    bids: number;
    highest_bid: number;
    won: number;
    total_bought: Record<string, number>;
    gold_spent: number;
    created: number;
    fees: number;
    completed: number;
    total_sold: Record<string, number>;
    gold_earned: number;
    no_bids: number;
  };
  claimed_items: {
    [key: string]: number;
  };
  uncategorized: {
    [key: string]: number | string | boolean;
  };
};
