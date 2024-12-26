// CREDITS: https://github.com/anderle02 & https://github.com/TGWaffles
// Modified by: https://github.com/DUckySoLucky/

import nbt from "prismarine-nbt";
import { gunzip } from "zlib";

export async function decodeItems(base64Strings: string[]) {
  try {
    const decodedItems = await Promise.all(
      base64Strings.flat().map(async (item) => {
        try {
          if (!item || !item.length) {
            return [];
          }

          const unzippedData = await new Promise<Buffer>((resolve, reject) =>
            gunzip(Buffer.from(item, "base64"), (error, unzippedData) => {
              if (error) reject(error);
              else resolve(unzippedData);
            })
          );

          const parsed = nbt.protos.big.parsePacketBuffer("nbt", unzippedData, 0);
          const simplified = nbt.simplify(parsed.data);
          return simplified.i;
        } catch (error) {
          console.error(`decodeItems | Failed to decode item: ${error}`);
          return null;
        }
      })
    );

    return decodedItems.filter((item) => item !== null);
  } catch (error) {
    console.error(`decodeItems | Failed to decode items: ${error}`);
    return [];
  }
}

export async function decodeItemsObject(base64Strings: Record<string, string>) {
  try {
    const decodedItemsArray = await decodeItems(Object.values(base64Strings));
    return Object.fromEntries(Object.keys(base64Strings).map((key, idx) => [key, decodedItemsArray[idx]]));
  } catch (error) {
    console.error(`decodeItemsObject | Failed to decode items object: ${error}`);
    return {};
  }
}

export async function decodeItem(encodedItem: string) {
  try {
    const [, unzippedData] = await new Promise<[typeof encodedItem, Buffer]>((resolve, reject) =>
      gunzip(Buffer.from(encodedItem, "base64"), (error, unzippedData) => {
        if (error) reject(error);
        else resolve([encodedItem, unzippedData]);
      })
    );

    const parsed = nbt.protos.big.parsePacketBuffer("nbt", unzippedData, 0);
    const simplified = nbt.simplify(parsed.data);
    return simplified.i;
  } catch (error) {
    console.error(`decodeItem | Failed to decode item: ${error}`);
    return null;
  }
}
