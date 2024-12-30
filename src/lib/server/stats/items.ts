// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { getArmor } from "$lib/server/stats/items/armor";
import { getEquipment } from "$lib/server/stats/items/equipment";
import { processItems } from "$lib/server/stats/items/processing";
import { getWardrobe } from "$lib/server/stats/items/wardrobe";
import type { GetItemsItems, Member, MuseumRaw } from "$types/global";
import { getPets, getSkilllTools, getWeapons } from "./items/category";
import { decodeItems } from "./items/decoding";
import { decodeMusemItems } from "./items/museum";
import { getMuseumItems } from "./museum";

export async function getItems(userProfile: Member, userMuseum: MuseumRaw | null, packs: string[]): GetItemsItems {
  const INVENTORY = userProfile.inventory;
  const outputPromises = {
    // INVENTORIES
    inventory: INVENTORY?.inv_contents?.data ?? "",
    enderchest: INVENTORY?.ender_chest_contents?.data ?? "",
    armor: INVENTORY?.inv_armor?.data ?? "",
    equipment: INVENTORY?.equipment_contents?.data ?? "",
    personal_vault: INVENTORY?.personal_vault_contents?.data ?? "",
    wardrobe: INVENTORY?.wardrobe_contents?.data ?? "",

    // BAGS
    potion_bag: INVENTORY?.bag_contents?.potion_bag?.data ?? "",
    talisman_bag: INVENTORY?.bag_contents?.talisman_bag?.data ?? "",
    fishing_bag: INVENTORY?.bag_contents?.fishing_bag?.data ?? "",
    // sacks_bag: INVENTORY?.bag_contents?.sacks_bag?.data ?? "",
    quiver: INVENTORY?.bag_contents?.quiver?.data ?? "",

    // BACKPACKS
    ...Object.entries(INVENTORY?.backpack_contents ?? {}).reduce((acc, [key, value]) => {
      acc[`backpack_${key}`] = value.data ?? "";
      return acc;
    }, {}),
    ...Object.entries(INVENTORY?.backpack_icons ?? {}).reduce((acc, [key, value]) => {
      acc[`backpack_icon_${key}`] = value.data ?? "";
      return acc;
    }, {})
  };

  const entries = Object.entries(outputPromises);
  const values = entries.map(([_, value]) => value);
  const decodedItems = await decodeItems(values);
  const newItems = await Promise.all(
    entries.map(async ([key, _], idx) => {
      if (!decodedItems[idx]) {
        return [key, []];
      }

      const processed = await processItems(decodedItems[idx], key, packs);
      return [key, processed];
    })
  );

  const output = { backpack: [] };
  const backpackIconMap = new Map(newItems.filter(([key]) => key.startsWith("backpack_icon_")));
  for (const [key, value] of newItems) {
    if (!key.includes("backpack")) {
      output[key] = value;
      continue;
    }

    if (key.startsWith("backpack_") && !key.includes("icon")) {
      const backpackIndex = key.split("_").pop();
      const iconKey = `backpack_icon_${backpackIndex}`;
      const backpackIcon = backpackIconMap.get(iconKey)[0];

      if (backpackIcon) {
        output.backpack.push({
          ...backpackIcon,
          containsItems: value
        });
      }
    }
  }

  output.museumItems = userMuseum ? await decodeMusemItems(userMuseum, packs) : null;

  output.armor = getArmor(output.armor);
  output.equipment = getEquipment(output.equipment);
  output.wardrobe = getWardrobe(output.wardrobe);

  const allItems = Object.values(output).flat();
  output.weapons = getWeapons(allItems);
  output.farming_tools = getSkilllTools("farming", allItems);
  output.mining_tools = getSkilllTools("mining", allItems);
  output.fishing_tools = getSkilllTools("fishing", allItems);
  output.pets = getPets(allItems);

  const museum = output.museumItems ? getMuseumItems(output.museumItems) : null;
  output.museumItems = [...Object.values(museum?.museumItems?.items ?? {}), ...(museum?.museumItems?.specialItems ?? [])]
    .filter((item) => item && item.borrowing === false)
    .map((item) => item.items)
    .flat();
  output.museum = museum?.inventory ?? [];

  return output;
}
