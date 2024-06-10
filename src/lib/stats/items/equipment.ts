import type { ProcessedItem } from "$types/stats";
import { getStatsFromItems } from "./stats";
import * as helper from "$lib/helper";

export function getEquipment(equipment: ProcessedItem[]) {
  if (equipment.some((a) => helper.getId(a) === "") === true) {
    return {
      equipment: equipment.filter((a) => helper.getId(a) !== ""),
      stats: {}
    };
  }
  // TODO: implement name & rarity parsing just like the armor

  return {
    equipment,
    stats: getStatsFromItems(equipment)
  };
}
