import * as helper from "$lib/server/helper";
import type { DecodedMuseumItems } from "$types/global";
import type { MuseumRaw } from "$types/raw/museum/lib";
import { processItems } from "./processing";

export async function decodeMusemItems(museum: MuseumRaw, customTextures: boolean, packs: string[]): Promise<DecodedMuseumItems> {
  const output = { value: 0, items: {}, special: [] } as DecodedMuseumItems;

  const itemPromises = Object.entries(museum.items ?? {}).map(async ([id, data]) => {
    const {
      donated_time: donatedTime,
      borrowing: isBorrowing,
      items: { data: decodedData }
    } = data;

    const encodedData = await processItems(decodedData, "museum", customTextures, packs);

    if (donatedTime) {
      // encodedData.map((i) => helper.addToItemLore(i, ["", `§7Donated: §c<local-time timestamp="${donatedTime}"></local-time>`]));
    }

    if (isBorrowing) {
      encodedData.map((i) => helper.addToItemLore(i, ["", `§7Status: §cBorrowing`]));
    }

    return {
      id,
      value: {
        donated_time: donatedTime,
        borrowing: isBorrowing ?? false,
        items: encodedData.filter((i) => i.id)
      }
    };
  });

  const specialPromises = (museum.special ?? []).map(async (special) => {
    const { donated_time: donatedTime, items } = special;
    const decodedData = await processItems(items.data, "museum", customTextures, packs);

    if (donatedTime) {
      // decodedData.map((i) => helper.addToItemLore(i, ["", `§7Donated: §c<local-time timestamp="${donatedTime}"></local-time>`]));
    }

    return { donated_time: donatedTime, items: decodedData.filter((i) => i.id) };
  });

  const itemResults = await Promise.all(itemPromises);
  itemResults.forEach(({ id, value }) => {
    output.items[id] = value;
  });

  output.special = await Promise.all(specialPromises);

  output.value = museum.value;

  return output;
}
