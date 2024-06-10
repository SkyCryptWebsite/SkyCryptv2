import type { Crystal, ProcessedItem } from "$types/global";
import type { Skill } from "./skills";

export type NodeData = {
  level: number;
  enabled: boolean;
  nodes: Record<string, number>;
  hotmLevelData: Skill;
  special_0: string;
  selectedPickaxeAbility: string;
  position: number;
  id: string;
  max_level: number;
  upgrade_type: string;
  requires: string[];
  positionType: string;
};

export type HotmItemData = {
  displayName?: string;
  position?: number;
  itemData?: {
    id: string;
    Damage: number;
    glowing: boolean;
    texture_path: string;
  };
  resources: {
    token_of_the_mountain: number;
    mithril_powder: number;
    gemstone_powder: number;
    glacite_powder: number;
  };
  last_reset: number;
  crystals: Record<string, Crystal>;
};

export type MiningStats = {
  level: Skill;
  selectedPickaxeAbility: string;
  tokens: {
    total: number;
    spent: number;
    available: number;
  };
  commissions: {
    milestone: number;
    completions: number;
  };
  crystalHollows: {
    crystalHollowsLastAccess: number;
    nucleusRuns: number;
    progress: {
      crystals: Record<string, string>;
      parts: Record<string, string>;
    };
  };
  hotm: ProcessedItem[];
};
