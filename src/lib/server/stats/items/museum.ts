import * as helper from "$lib/server/helper";
import type { DecodedMuseumItems } from "$types/global";
import type { MuseumRaw } from "$types/raw/museum/lib";
import { decodeItems, decodeItemsObject } from "./decoding";
import { processItems } from "./processing";

export async function decodeMusemItems(museum: MuseumRaw, packs: string[]): Promise<DecodedMuseumItems> {
  const output = { value: 0, items: {}, special: [] } as DecodedMuseumItems;

  const specialItems = museum.special ? museum.special.map((special) => special.items.data) : [];
  const museumItems = museum.items ? Object.fromEntries(Object.entries(museum.items).map(([key, value]) => [key, value.items.data])) : {};

  const [decodedmuseumItems, decodedSpecialItems] = await Promise.all([decodeItemsObject(museumItems), decodeItems(specialItems)]);

  const [itemResults, specialResults] = await Promise.all([
    Promise.all(
      Object.entries(decodedmuseumItems).map(async ([id, itemData]) => {
        const encodedData = await processItems(itemData, "museum", packs);

        const { donated_time: donatedTime, borrowing: isBorrowing } = museum.items[id];
        const items = encodedData
          .filter((i) => i.id)
          .map((i) => {
            const itemLore = i.tag.display.Lore;
            if (donatedTime) {
              itemLore.push("", `§7Donated: §c${helper.formatTimestamp(donatedTime)}`);
            }
            if (isBorrowing) {
              itemLore.push("", `§7Status: §cBorrowing`);
            }

            return i;
          });

        return {
          id,
          donated_time: donatedTime,
          borrowing: isBorrowing ?? false,
          items
        };
      })
    ),
    Promise.all(
      decodedSpecialItems.map(async (itemData, index) => {
        const specialItem = museum.special[index];
        const decodedData = await processItems(itemData, "museum", packs);

        const { donated_time: donatedTime } = specialItem;
        const items = decodedData
          .filter((i) => i.id)
          .map((i) => {
            const itemLore = i.tag.display.Lore;
            if (donatedTime) {
              itemLore.push("", `§7Donated: §c${helper.formatTimestamp(donatedTime)}`);
            }
            return i;
          });

        return { donated_time: donatedTime, items };
      })
    )
  ]);

  output.items = Object.fromEntries(itemResults.map((data) => [data.id, data]));
  output.special = specialResults;
  output.value = museum.value;

  return output;
}
