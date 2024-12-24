import nbt from "prismarine-nbt";
import { gunzip } from "zlib";
import { itemData } from "./data/itemData";

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

const timeNow = Date.now();
const items = await decodeItems(Object.values(itemData));
console.log(`Decoded ${items.length} items in ${Date.now() - timeNow}ms`);
