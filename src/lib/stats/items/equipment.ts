import type { ProcessedItem } from '$types/stats';
import { getStatsFromItems } from './stats';

export function getEquipment(equipment: ProcessedItem[]) {
	// TODO: implement name & rarity parsing just like the armor

	return {
		equipment,
		stats: getStatsFromItems(equipment)
	};
}
