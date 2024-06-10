import { getRawLore } from "$lib/helper";
import type { ProcessedItem } from "$types/stats";
import * as constants from "$constants/constants";
import type { ItemStats } from "$types/processed/profile/stats";

export function getStatsFromItem(item: ProcessedItem) {
  const regex = /^([A-Za-z ]+): ([+-]([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{0,2})?))/;
  const stats = {} as ItemStats;

  if (item.tag?.display?.Lore === undefined) {
    return stats;
  }

  const lore = (item.tag.display.Lore || []).map((line) => getRawLore(line));

  for (const line of lore) {
    const match = regex.exec(line);

    if (match == null) {
      continue;
    }

    const statName = Object.keys(constants.STATS_DATA).find((key) => constants.STATS_DATA[key].nameLore === match[1]);
    const statValue = parseFloat(match[2].replace(/,/g, ""));
    if (statName) {
      stats[statName] = 0;

      // @ts-expect-error: Object is possibly 'null'.
      stats[statName] += statValue;
    }
  }

  return stats;
}

export function getStatsFromItems(items: ProcessedItem[]) {
  const stats = {} as ItemStats;
  for (const item of items) {
    const itemStats = getStatsFromItem(item);
    for (const stat in itemStats) {
      stats[stat] ??= 0;

      // @ts-expect-error: Object is possibly 'null'.
      stats[stat] += itemStats[stat];
    }
  }

  return Object.fromEntries(Object.entries(stats).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0)));
}
