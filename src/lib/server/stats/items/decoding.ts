// CREDITS: https://github.com/anderle02 & https://github.com/TGWaffles
// Modified by: https://github.com/DUckySoLucky/

import nbt from "prismarine-nbt";
import { gunzip } from "zlib";

export async function decodeItems(encodedItems) {
  try {
    const decodedItems = await Promise.all(
      encodedItems.flat().map(async (item) => {
        try {
          const [, unzippedData] = await new Promise<[typeof item, Buffer]>((resolve, reject) =>
            gunzip(Buffer.from(item, "base64"), (error, unzippedData) => {
              if (error) reject(error);
              else resolve([item, unzippedData]);
            })
          );

          const parsed = nbt.protos.big.parsePacketBuffer("nbt", unzippedData, 0);
          const simplified = nbt.simplify(parsed.data);
          return simplified.i;
        } catch (error) {
          console.error(`Failed to decode item: ${error}`);
          return null;
        }
      })
    );

    return decodedItems.filter((item) => item !== null);
  } catch (error) {
    console.error(`Failed to decode items: ${error}`);
    return [];
  }
}

export async function decodeItem(encodedItem) {
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
    console.error(`Failed to decode item: ${error}`);
    return null;
  }
}
