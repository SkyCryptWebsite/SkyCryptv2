import type { PlusColor, Rank, RankName } from "$types/processed/profile/rank";
import type { Player } from "$types/raw/player/lib";
import { RANKS, RANK_PLUS_COLORS } from "../constants/constants";

export function getRank(player: Player): Rank | undefined {
  const rank = getRankName(player);
  if (!rank) return undefined;

  const defaults = RANKS[rank];

  if (rank === "SUPERSTAR" && player.monthlyRankColor === "AQUA") {
    return {
      ...defaults,
      color: "#33aec3"
    };
  }

  return defaults;
}

export function getRankName(player: Player): RankName | undefined {
  if (player.prefix) {
    // Clean extraneous color codes (ex: §c[OWNER] -> OWNER)
    const match = player.prefix.replace(/§\w/g, "").match(/\[(.+?)\]/);
    if (match) {
      return match[1] as RankName;
    }
  }

  if (player.rank && player.rank !== "NORMAL") {
    return player.rank as RankName;
  }

  if (player.monthlyPackageRank && player.monthlyPackageRank !== "NONE") {
    return player.monthlyPackageRank as RankName;
  }

  if (player.newPackageRank && player.newPackageRank !== "NONE") {
    return player.newPackageRank as RankName;
  }

  return undefined;
}

export function getRankDefaults(rank?: RankName) {
  if (!rank) return undefined;

  return RANKS[rank];
}

export function convertPlusColorToHex(color?: PlusColor) {
  if (!color) return undefined;

  return RANK_PLUS_COLORS[color];
}
