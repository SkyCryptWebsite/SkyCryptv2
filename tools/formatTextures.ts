import { Textures } from "./data/textures";
import fs from "node:fs";

const data = Textures.sort((a, b) => a.id.localeCompare(b.id));

for (const textureData of data) {
  const { name, id, texture } = textureData;

  const buffer = Buffer.from(texture.split(",")[1], "base64");

  const itemId = id.split(":")[1];
  const itemDamage = id.split(":")[2];

  console.log(itemId, parseInt(itemDamage ?? 0), name);

  fs.writeFileSync("static/resourcepacks/Vanilla/assets/minecraft/mcpatcher/cit/textures/" + id.replace("minecraft:", "") + ".png", buffer);

  const properties = [`type=item`, `items=${id}`, `texture=${id.replace("minecraft:", "")}`, `damage=${parseInt(itemDamage ?? 0)}`];
  fs.writeFileSync("static/resourcepacks/Vanilla/assets/minecraft/mcpatcher/cit/textures/" + id.replace("minecraft:", "") + ".properties", properties.join("\n"));
}
