import type { Player } from "$types/raw/player/lib";
import { RANKS, RANK_PLUS_COLORS } from "../constants/constants";
import { getRawLore } from "../helper";

export function getRank(player: Player) {
  const output = {
    rankText: "",
    rankColor: "",
    plusText: "",
    plusColor: ""
  };

  const rankName = player.prefix ? getRawLore(player.prefix).replaceAll(/\[|\]/g, "") : player.rank && player.rank != "NORMAL" ? player.rank : player.monthlyPackageRank && player.monthlyPackageRank != "NONE" ? player.monthlyPackageRank : player.newPackageRank ? player.newPackageRank : player.packageRank ? player.packageRank : "NONE";

  if (RANKS[rankName]) {
    const { tag, color, plus, plusColor } = RANKS[rankName];
    output.rankText = tag;

    if (rankName == "SUPERSTAR") {
      output.rankColor = RANK_PLUS_COLORS[player.monthlyRankColor as string] ?? color;
    } else {
      output.rankColor = color;
    }

    if (plus) {
      output.plusText = plus;

      if (rankName == "SUPERSTAR" || rankName == "MVP_PLUS") {
        output.plusColor = RANK_PLUS_COLORS[player.rankPlusColor as string] ?? plusColor;
      } else if (plusColor) output.plusColor = plusColor;
    }
  }

  return output;
}
