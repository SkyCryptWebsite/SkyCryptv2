import { getHeadTextureUUID } from "$lib/server/helper";
import type { NotEnoughUpdatesBestiaryConstants } from "$types/processed/NotEnoughUpdates/bestiary";
import type { IslandData, Mob, NotEnoughUpdatesBestiary } from "$types/raw/NotEnoughUpdates/bestiary";

function formatBestiaryMobs(mobs: Mob[]) {
  const output = [];
  for (const mob of mobs) {
    output.push({
      name: mob.name.replace(/§./g, ""),
      texture: mob.texture ? `/api/head/${getHeadTextureUUID(mob.texture)}` : `/api/item/${mob.item}`,
      cap: mob.cap,
      mobs: mob.mobs,
      bracket: mob.bracket
    });
  }

  return output;
}

export function formatBestiaryConstants(bestiary: NotEnoughUpdatesBestiary) {
  const bestiaryConstants = {
    brackets: bestiary.brackets,
    islands: {}
  } as NotEnoughUpdatesBestiaryConstants;

  for (const [islandId, islandDataRaw] of Object.entries(bestiary).filter(([key]) => key !== "brackets")) {
    const islandData = islandDataRaw as unknown as IslandData;
    if (islandData.hasSubcategories === true) {
      for (const [categoryId, categoryDataRaw] of Object.entries(islandData)) {
        const categoryData = categoryDataRaw as unknown as IslandData;
        if (categoryData.mobs === undefined) {
          continue;
        }

        const id = islandId === categoryId ? islandId : `${islandId}:${categoryId}`;
        const name = categoryData.name.includes(islandData.name) ? categoryData.name : `${categoryData.name} ${islandData.name}`;
        bestiaryConstants.islands[id] = {
          name: name,
          texture: categoryData.texture ? `/api/head/${getHeadTextureUUID(categoryData.icon.texture)}` : `/api/item/${categoryData.icon.item}`,
          mobs: formatBestiaryMobs(categoryData.mobs)
        };
      }

      continue;
    }

    bestiaryConstants.islands[islandId] = {
      name: islandData.name,
      texture: islandData.texture ? `/api/head/${getHeadTextureUUID(islandData.icon.texture)}` : `/api/item/${islandData.icon.item}`,
      mobs: formatBestiaryMobs(islandData.mobs)
    };
  }

  return bestiaryConstants;
}
