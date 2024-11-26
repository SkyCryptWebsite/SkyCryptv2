// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { getArmor } from "$lib/server/stats/items/armor";
import { getEquipment } from "$lib/server/stats/items/equipment";
import { processItems } from "$lib/server/stats/items/processing";
import { getWardrobe } from "$lib/server/stats/items/wardrobe";
import type { Items, Member, ProcessedItem } from "$types/global";
import { getPets, getSkilllTools, getWeapons } from "./items/category";

export async function getItems(userProfile: Member): Items {
  const INVENTORY = userProfile.inventory;

  const outputPromises = {
    // INVENTORIES
    inventory: processItems(INVENTORY?.inv_contents?.data ?? "", "inventory", true, []),
    enderchest: processItems(INVENTORY?.ender_chest_contents?.data ?? "", "enderchest", true, []),
    armor: processItems(INVENTORY?.inv_armor?.data ?? "", "armor", true, []),
    equipment: processItems(INVENTORY?.equipment_contents?.data ?? "", "equipment", true, []),
    personal_vault: processItems(INVENTORY?.personal_vault_contents?.data ?? "", "personal_vault", true, []),
    wardrobe: processItems(INVENTORY?.wardrobe_contents?.data ?? "", "wardrobe", true, []),

    // BAGS
    potion_bag: processItems(INVENTORY?.bag_contents?.potion_bag?.data ?? "", "potion_bag", true, []),
    talisman_bag: processItems(INVENTORY?.bag_contents?.talisman_bag?.data ?? "", "talisman_bag", true, []),
    fishing_bag: processItems(INVENTORY?.bag_contents?.fishing_bag?.data ?? "", "fishing_bag", true, []),
    sacks_bag: processItems(INVENTORY?.bag_contents?.sacks_bag?.data ?? "", "sacks_bag", true, []),
    quiver: processItems(INVENTORY?.bag_contents?.quiver?.data ?? "", "quiver", true, []),

    // BACKPACKS
    backpack: {} as Record<string, ProcessedItem[]>
  };

  const output = await Promise.all(Object.values(outputPromises)).then((values) => {
    const output: Record<string, ProcessedItem[]> = {};

    Object.keys(outputPromises).forEach((key, index) => {
      if (values[index]) {
        output[key] = values[index] as ProcessedItem[];
      } else {
        output[key] = [];
      }
    });

    return output;
  });

  if (INVENTORY?.backpack_icons) {
    const backpackPromises = Object.entries(INVENTORY.backpack_icons).map(([index, icon]) => {
      const backpackIndex = `slot_${index}`;

      const itemPromise = processItems(icon?.data ?? "", `backpack_icon_${index}`, true, []);
      const contentsPromise = processItems(INVENTORY?.backpack_contents?.[index]?.data ?? "", `backpack_${index}`, true, []);

      return Promise.all([itemPromise, contentsPromise]).then(([backpackItem, containsItems]) => {
        if (backpackItem) {
          backpackItem[0].containsItems = containsItems;

          output.backpack[backpackIndex] = backpackItem;
        }
      });
    });

    await Promise.all(backpackPromises);

    output.backpack = Object.fromEntries(
      Object.entries(output.backpack).sort((a, b) => {
        const aSlot = parseInt(a[0].split("_")[1]);
        const bSlot = parseInt(b[0].split("_")[1]);

        return aSlot - bSlot;
      })
    );
  }

  output.armor = getArmor(output.armor);
  output.equipment = getEquipment(output.equipment);
  output.wardrobe = getWardrobe(output.wardrobe);
  output.getAllItems = () => {
    const allItems = Object.values(output).flat(1).concat(Object.values(output.backpack).flat(1));

    return allItems;
  };

  const allItems = output.getAllItems();
  output.weapons = getWeapons(allItems);
  output.farming_tools = getSkilllTools("farming", allItems);
  output.mining_tools = getSkilllTools("mining", allItems);
  output.fishing_tools = getSkilllTools("fishing", allItems);
  output.pets = getPets(allItems);

  return output;
}
