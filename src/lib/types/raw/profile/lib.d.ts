import type { Pet } from "$types/global";

export type Options = {
  cacheOnly: boolean;
};

export type ProfilesResponse = {
  success: boolean;
  cause?: string;
  profiles: Profile[];
};

export type Profile = {
  profile_id: string;
  cute_name: string;
  selected: boolean;
  game_mode: string;
  uuid: string;
  members: Record<string, Member>;
  banking: Banking;
  community_upgrades: CommunityUpgrades;
};

export type CommunityUpgrades = {
  currently_upgrading: string | null;
  upgrade_states: CommunityUpgrade[];
};

export type CommunityUpgrade = {
  upgrade: string;
  tier: number;
  started_ms: number;
  started_by: string;
  claimed_by: string;
  fasttracked: boolean;
};

export type Member = {
  player_data?: PlayerData;
  jacobs_contest?: JacobsContest;
  leveling?: Leveling;
  profile?: MemberProfile;
  currencies?: Currencies;
  fairy_soul?: FairySouls;
  inventory?: Inventory;
  rift?: Rift;
  nether_island_player_data?: NetherIslandPlayerData;
  collection: Collection;
  pets_data: ProfilePets;
  mining_core: Mining;
  objectives: Objectives;
  quests: Quests;
  player_stats: PlayerStats;
  trophy_fish?: TrophyFish;
  slayer: Slayer;
  dungeons: Dungeons;
  bestiary: Bestiary;
  item_data: MemberItemData;
  forge?: Forge;
  experimentation: Experimentation;
  coop_invitation?: {
    confirmed: boolean;
  };
};

export type Medal = "gold" | "silver" | "bronze";

export type JacobsContest = {
  perks?: Record<string, number>;
  unique_brackets?: Record<Medal, string[]>;
  medals_inv?: Record<Medal, number>;
  contests: Record<string, Contest>;
};

export type Quests = {
  trapper_quest: {
    pelt_count: number;
  };
};

export type Contest = {
  collected: number;
  claimed_rewards?: boolean;
  claimed_position?: number;
  claimed_participants?: number;
  claimed_medal: Medal;
};

export type Leveling = {
  experience: number;
};

export type MemberProfile = {
  first_join?: number;
  cookie_buff_active?: boolean;
  personal_bank_upgrade?: number;
  deletion_notice?: {
    timestamp: number;
  };
};

export type Banking = {
  balance: number;
};

export type FairySouls = {
  total_collected: number;
};

export type Inventory = {
  inv_contents?: DecodedInventory;
  ender_chest_contents?: DecodedInventory;
  backpack_icons?: Record<string, DecodedInventory>;
  bag_contents?: BagContents;
  inv_armor?: DecodedInventory;
  equipment_contents?: DecodedInventory;
  personal_vault_contents?: DecodedInventory;
  backpack_contents?: Record<string, DecodedInventory>;
  wardrobe_contents?: DecodedInventory;
};

export type BagContents = {
  potion_bag?: DecodedInventory;
  talisman_bag?: DecodedInventory;
  fishing_bag?: DecodedInventory;
  sacks_bag?: DecodedInventory;
  quiver?: DecodedInventory;
};

export type DecodedInventory = {
  type: number;
  data: string;
};

export type PlayerData = {
  experience?: Experience;
  crafted_generators?: string[];
  active_effects: string[];
  paused_effects: string[];
  disabled_potion_effects: string[];
  reaper_peppers_eaten: number;
};

export type Experience = {
  SKILL_FISHING?: number;
  SKILL_ALCHEMY?: number;
  SKILL_DUNGEONEERING?: number;
  SKILL_RUNECRAFTING?: number;
  SKILL_MINING?: number;
  SKILL_FARMING?: number;
  SKILL_ENCHANTING?: number;
  SKILL_TAMING?: number;
  SKILL_FORAGING?: number;
  SKILL_SOCIAL?: number;
  SKILL_CARPENTRY?: number;
  SKILL_COMBAT?: number;
};

export type Rift = {
  access?: {
    consumed_prism?: boolean;
  };
  dead_cats?: {
    found_cats?: string[];
    montezuma?: Pet;
  };
  enigma: {
    found_souls: string[];
  };
  castle: {
    grubber_stacks: number;
  };
  gallery: {
    secured_trophies: {
      type: string;
      timestamp: number;
    }[];
  };
  wither_cage: {
    killed_eyes: string[];
  };
};

export type NetherIslandPlayerData = {
  abiphone?: {
    active_contacts: string[];
  };
  kuudra_completed_tiers: Record<string, number>;
  dojo: Record<string, number>;
  selected_faction: string;
  mages_reputation: number;
  barbarians_reputation: number;
};

export type ProfilePets = {
  pets: Pet[];
};

export type Mining = {
  nodes: Record<string, number>;

  experience: number;

  greater_mines_last_access: number;
  last_reset: number;

  tokens_spent: number;
  selected_pickaxe_ability: string;

  powder_mithril: number;
  powder_mithril_total: number;
  powder_spent_mithril: number;
  powder_gemstone: number;
  powder_gemstone_total: number;
  powder_spent_gemstone: number;
  powder_glacite: number;
  powder_glacite_total: number;
  powder_spent_glacite: number;

  crystals: Record<string, Crystal>;

  biomes: {
    precursor: {
      parts_delivered: string[];
    };
  };
};

export type Objectives = {
  tutorial?: string[];
};

export type Crystal = {
  state: string;
  total_found: number;
  total_placed: number;
};

export type PlayerStats = {
  kills: Record<string, number>;
  deaths: Record<string, number>;
  items_fished?: {
    total: number;
    normal: number;
    treasure: number;
    large_treasure: number;
    trophy_fish: number;
  };
  shredder_rod?: {
    fished: number;
    bait: number;
  };
  rift: PlayerStatsRift;
  races: PlayerStarsRaces;
  gifts: {
    total_given: number;
    total_received: number;
  };
  winter: {
    most_snowballs_hit: number;
    most_damage_dealt: number;
    most_magma_damage_dealt: number;
    most_cannonballs_hit: number;
  };
  end_island: {
    dragon_fight: {
      ender_crystals_destroyed: number;
      most_damage: Record<string, number>;
      fastest_kill: Record<string, number>;
    };
  };
  highest_critical_damage: number;
  pets: {
    milestone: {
      sea_creatures_killed: number;
      ores_mined: number;
    };
  };
  mythos: {
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
};

export type TrophyFish = {
  rewards: number[];
  total_caught: number;
  [string: string]: number;
};

export type Slayer = {
  slayer_bosses: Record<string, SlayerBoss>;
};

export type SlayerBoss = {
  claimed_levels: Record<string, boolean>;
  xp?: number;
  boss_kills_tier_0: number;
  boss_kills_tier_1: number;
  boss_kills_tier_2: number;
  boss_kills_tier_3: number;
  boss_kills_tier_4: number;
};

export type Dungeons = {
  dungeon_types: Record<string, Catacombs>;
  player_classes: Record<string, PlayerClass>;
  selected_dungeon_class: string;
  secrets: number;
};

export type PlayerClass = {
  experience: number;
};

export type Catacombs = {
  [key: string]: number | Record<string, number>;

  experience: number;

  highest_tier_completed: number;
  times_played: Record<string, number>;
  tier_completions: Record<string, number>;
  milestone_completions: Record<string, number>;
  mobs_killed: Record<string, number>;
  most_mobs_killed: Record<string, number>;
  watcher_kills: Record<string, number>;
  most_damage_berserk: Record<string, number>;
  most_damage_mage: Record<string, number>;
  most_damage_healer: Record<string, number>;
  most_damage_archer: Record<string, number>;
  most_damage_tank: Record<string, number>;
  most_healing: Record<string, number>;
  fastest_time: Record<string, number>;
  fastest_time_s: Record<string, number>;
  fastest_time_s_plus: Record<string, number>;
  best_score: Record<string, number>;
  best_runs: Record<string, BestRun[]>;
};

export type BestRun = {
  timestamp: number;
  score_exploration: number;
  score_speed: number;
  score_skill: number;
  score_bonus: number;
  dungeon_class: string;
  elapsed_time: number;
  damage_dealt: number;
  deaths: number;
  mobs_killed: number;
  secrets_found: number;
  damage_mitigated: number;
};

export type Bestiary = {
  kills: Record<string, number>;
};

export type Collection = {
  [key: string]: number;
};

export type PlayerStatsRift = {
  lifetime_motes_earned: number;
  motes_orb_pickup: number;
};

export type Currencies = {
  coin_purse: number;
  motes_purse: number;
  essence: Record<string, { current: number }>;
};

export type PlayerStarsRaces = {
  foraging_race_best_time: number;
  end_race_best_time: number;
  chicken_race_best_time_2: number;
  dungeon_hub: {
    [key: string]: number;
  };
};

export type MemberItemData = {
  soulflow: number;
  teleporter_pill_consumed: boolean;
};

export type Forge = {
  forge_processes: {
    forge_1: Record<string, ForgeProcess>;
  };
};

export type ForgeProcess = {
  id: string;
  startTime: number;
  slot: number;
};

export type Experimentation = Record<string, ExperimentationGame>;

export type ExperimentationGame = {
  last_attempt: number;
  last_claimed: number;
  bonus_clicks: number;
  [string: string]: number;
};

export type DecodedMuseumItems = {
  value: number;
  items: Record<string, { donated_time: number; borrowing: boolean; items: ProcessedItem[] }>;
  special: { donated_time: number; items: ProcessedItem[] }[];
};

export type MuseumItems = {
  [key: string]: ProcessedItem & {
    donated_as_child: boolean;
    id: string;
  };
};
