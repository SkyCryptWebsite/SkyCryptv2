import { createCanvas, loadImage, type Canvas } from "@napi-rs/canvas";
import fs from "fs-extra";
import _ from "lodash";
import mm from "micromatch";
import minecraftData from "minecraft-data";
import path from "path";
import RJSON from "relaxed-json";
import UPNG from "upng-js";
import util from "util";
import { getCacheFilePath, getCacheFolderPath, getFolderPath, getId, getPath, getTextureValue, hasPath } from "./helper";
const mcData = minecraftData("1.8.9");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import apng2gif from "apng2gif-bin";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sharp from "sharp";

import { getFileHash } from "$lib/server/helper/hashes";
import type { ItemTexture, OutputResourcePack, OutputTexture, ResourcePack, TextureAnimation, TextureModel } from "$types/custom-resources";
import type { Item, ProcessedItem, getTextureParams } from "$types/processed/profile/items";
import child_process from "child_process";
import { format } from "numerable";
const execFile = util.promisify(child_process.execFile);

const NORMALIZED_SIZE = 128;
const RESOURCE_CACHING = process.env.NODE_ENV === "development";

const FOLDER_PATH = getFolderPath();
const RESOURCE_PACK_FOLDER = path.resolve(getFolderPath(), "static", "resourcepacks");

const CACHE_FOLDER_PATH = getCacheFolderPath();
const PACK_HASH_CACHE_FILE = getCacheFilePath(CACHE_FOLDER_PATH, "json", "pack_hashes", "json");
const RESOURCES_CACHE_FILE = getCacheFilePath(CACHE_FOLDER_PATH, "json", "custom_resources", "json");

let resourcesReady = false;
const readyPromise = new Promise((resolve) => {
  setInterval(() => {
    if (resourcesReady) {
      resolve(null);
    }
  }, 1000);
});

async function getFiles(dir: string, fileList: string[]) {
  const files = await fs.readdir(dir);

  fileList = fileList || [];

  for (const file of files) {
    const fileStat = await fs.stat(path.resolve(dir, file));

    if (fileStat.isDirectory()) {
      fileList = await getFiles(path.resolve(dir, file), fileList);
    } else {
      fileList.push(path.resolve(dir, file));
    }
  }

  return fileList;
}

function getFrame(src: Canvas, frame: number) {
  const dst = createCanvas(NORMALIZED_SIZE, NORMALIZED_SIZE);
  const ctx = dst.getContext("2d");

  ctx.drawImage(src, 0, frame * NORMALIZED_SIZE * -1);

  return dst;
}

let resourcePacks: ResourcePack[] = [];
let packConfigHashes: { [key: string]: string } = {};

const outputPacks: OutputResourcePack[] = [];

export async function init() {
  console.log(`[CUSTOM-RESOURCES] Custom Resources loading started.`);
  const timeNow = performance.now();

  await loadPackConfigs();
  let resourcesUpToDate = false;

  try {
    packConfigHashes = JSON.parse(fs.readFileSync(PACK_HASH_CACHE_FILE, "utf8"));

    if (Object.keys(packConfigHashes).length !== resourcePacks.length) {
      throw new Error("The amount of config hashes does not match the amount of packs");
    }

    resourcePacks.forEach((pack) => {
      if (packConfigHashes[pack.config.id] !== pack.config.hash) {
        throw new Error("Config hashes were not matching!");
      }
    });

    resourcesUpToDate = true;
  } catch {
    packConfigHashes = {};
    resourcePacks.forEach((pack) => {
      packConfigHashes[pack.config.id] = pack.config.hash;
    });

    fs.writeFileSync(PACK_HASH_CACHE_FILE, JSON.stringify(packConfigHashes));
  }

  try {
    if (!RESOURCE_CACHING) {
      throw new Error("Resource caching has been disabled!");
    }

    if (resourcesUpToDate) {
      resourcePacks = JSON.parse(fs.readFileSync(RESOURCES_CACHE_FILE, "utf8"));
    } else {
      throw new Error("Resources need to be loaded!");
    }
  } catch {
    await loadResourcePacks();

    fs.writeFileSync(RESOURCES_CACHE_FILE, JSON.stringify(resourcePacks));
  }

  resourcePacks = resourcePacks.sort((a, b) => b.config.priority - a.config.priority);
  resourcePacks.forEach((pack) => {
    outputPacks.push(
      Object.assign(
        {
          base_path: "/" + path.relative(path.resolve(FOLDER_PATH, "..", "..", "static"), pack.base_path)
        },
        pack.config
      )
    );
  });

  resourcesReady = true;

  const packs = new Set(resourcePacks.map((pack) => pack.config.id));
  console.log(`[CUSTOM-RESOURCES] Successfully loaded ${packs.size} resource packs in ${(performance.now() - timeNow).toFixed(2)}ms`);
}

async function loadPackConfigs() {
  for (const packOrFile of await fs.readdir(RESOURCE_PACK_FOLDER, { withFileTypes: true })) {
    if (!packOrFile.isDirectory()) {
      continue;
    }

    const pack = packOrFile.name;
    const basePath = path.resolve(RESOURCE_PACK_FOLDER, pack);

    try {
      const configPath = path.resolve(basePath, "config.json");

      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      config.hash = await getFileHash(configPath);

      resourcePacks.push({
        base_path: basePath,
        config,
        textures: []
      });
    } catch {
      console.log("Couldn't find config for resource pack", pack);
    }
  }
}

async function loadResourcePacks() {
  resourcePacks = resourcePacks.sort((a, b) => a.config.priority - b.config.priority);

  for (const pack of resourcePacks) {
    pack.files = await getFiles(path.resolve(pack.base_path, "assets", "minecraft", "mcpatcher", "cit"), []);
    pack.textures = [];

    for (const file of pack.files) {
      if (path.extname(file) != ".properties") {
        continue;
      }

      const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
      const properties: { [key: string]: string } = {};

      for (const line of lines) {
        // Skipping comments
        if (line.startsWith("#")) {
          continue;
        }

        const split = line.split("=");

        if (split.length < 2) {
          continue;
        }

        properties[split[0]] = split.slice(1).join("=");
      }

      // Empty properties, probably whole file contaiend only comments
      if (Object.keys(properties).length === 0) {
        continue;
      }

      // Ignoring when type is set and is not "item"
      if ("type" in properties && properties.type !== "item") {
        continue;
      }

      const texture: Partial<ItemTexture> = {
        weight: pack.config.priority,
        animated: false,
        file: path.basename(file),
        match: []
      };

      let textureFile = "texture" in properties ? path.resolve(path.dirname(file), properties.texture) : path.resolve(path.dirname(file), path.basename(file, ".properties"));

      if ("texture.bow_standby" in properties) {
        textureFile = path.resolve(path.dirname(file), properties["texture.bow_standby"]);
      }

      if ("model" in properties) {
        const modelFile = path.resolve(path.dirname(file), properties["model"]);

        try {
          const model = RJSON.parse(await fs.readFile(modelFile, "utf8")) as TextureModel;

          if (model.parent == "builtin/generated") {
            const layers = Object.keys(model.textures).sort((a, b) => Number(a) - Number(b));
            const topLayer = layers.pop();

            if (topLayer && topLayer.startsWith("layer")) {
              const layerPath = path.resolve(pack.base_path, "assets", "minecraft", model.textures[topLayer] + ".png");
              await fs.access(layerPath, fs.constants.F_OK);

              textureFile = layerPath;
            }
          }
        } catch {
          // ...
        }
      }

      if (Object.keys(properties).filter((a) => a.includes("texture.leather_")).length == 2) {
        try {
          const leatherProperties = Object.keys(properties).filter((a) => a.includes("texture.leather_"));

          let leatherBase = properties[leatherProperties.find((a) => !a.includes("_overlay")) ?? 1];
          let leatherOverlay = properties[leatherProperties.find((a) => a.includes("_overlay")) ?? 1];

          if (!leatherBase.endsWith(".png")) {
            leatherBase += ".png";
          }

          if (!leatherOverlay.endsWith(".png")) {
            leatherOverlay += ".png";
          }

          const leather = {
            base: path.resolve(path.dirname(file), leatherBase),
            overlay: path.resolve(path.dirname(file), leatherOverlay)
          };

          for (const id in leather) {
            const part = id as "base" | "overlay";

            await fs.access(leather[part], fs.constants.F_OK);

            const leatherImage = sharp(leather[part]);
            const leatherMetadata = await leatherImage.metadata();

            if (leatherMetadata.width != NORMALIZED_SIZE && leatherMetadata.height && leatherMetadata.width) {
              await fs.writeFile(
                leather[part],
                await leatherImage
                  .resize(NORMALIZED_SIZE, leatherMetadata.height * (NORMALIZED_SIZE / leatherMetadata.width), {
                    kernel: sharp.kernel.nearest
                  })
                  .toBuffer()
              );
            }
          }

          texture.leather = leather;
        } catch {
          // ...
        }
      } else if (Object.keys(properties).filter((a) => a.includes("texture.leather_") && a.includes("_overlay")).length == 1) {
        const leatherProperties = Object.keys(properties).find((a) => a.includes("texture.leather_") && a.includes("_overlay"));

        textureFile = path.resolve(path.dirname(file), properties[leatherProperties as string]);
      }

      if (!textureFile.endsWith(".png")) {
        textureFile += ".png";
      }

      try {
        await fs.access(textureFile, fs.constants.F_OK);
      } catch {
        continue;
      }

      texture.path = textureFile;

      const textureImage = sharp(textureFile);
      const textureMetadata = await textureImage.metadata();

      if (textureMetadata.width != NORMALIZED_SIZE && textureMetadata.height && textureMetadata.width) {
        await fs.writeFile(
          textureFile,
          await textureImage
            .resize(NORMALIZED_SIZE, Math.floor(textureMetadata.height * (NORMALIZED_SIZE / textureMetadata.width)), {
              kernel: sharp.kernel.nearest
            })
            .toBuffer()
        );
      }

      try {
        const imageData = await fs.readFile(textureFile).catch(() => {
          console.log("Error reading file", textureFile);
        });

        if (!imageData) {
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const decode = UPNG.decode(imageData);
        if (decode == null) {
          continue;
        }

        if (decode.frames.length > 0) {
          texture.animated = true;
        }
      } catch {
        console.log("Error reading file", textureFile);
        texture.animated = false;
      }

      for (const property in properties) {
        if (property == "weight") {
          texture.weight ??= 0;
          texture.weight += parseInt(properties[property]);
        }

        if (property == "items" || property == "matchItems") {
          const itemName = properties[property].trim().replace("minecraft:", "").split(":")[0];
          const item = mcData.itemsByName[itemName];
          if (item) {
            texture.id = item.id;
            texture.damage ??= 0;
          }
        }

        if (property === "vanillaId") {
          texture.id = parseInt(properties[property]);
        }

        if (property == "damage") {
          texture.damage = parseInt(properties[property]);
        }

        if (!property.startsWith("nbt.")) {
          continue;
        }

        const regexString = properties[property];
        let regex: RegExp;

        if (regexString.includes("\\u00A7")) {
          regex = mm.makeRe(regexString.toString().replace(/\\u00A7[0-9a-fk-or]/g, ""));
        }

        if (regexString.startsWith("ipattern:")) {
          regex = mm.makeRe(regexString.substring(9), { nocase: true });
        } else if (regexString.startsWith("pattern:")) {
          regex = mm.makeRe(regexString.substring(9));
        } else if (regexString.startsWith("iregex:")) {
          regex = new RegExp(regexString.substring(7), "i");
        } else if (regexString.startsWith("regex:")) {
          regex = new RegExp(regexString.substring(6));
        } else {
          if (property == "nbt.ExtraAttributes.id") {
            texture.skyblock_id = regexString;
          }

          regex = new RegExp(`^${_.escapeRegExp(regexString)}$`);
        }

        texture.match ??= [];
        texture.match.push({
          value: property.substring(4),
          regex: regex.toString()
        });
      }

      let mcMeta;

      try {
        mcMeta = await fs.readFile(textureFile + ".mcmeta", "utf8");
      } catch {
        // ...
      }

      let metaProperties = {};
      if (mcMeta) {
        try {
          metaProperties = RJSON.parse(mcMeta);
        } catch {
          // ...
        }
      }

      if ("animation" in metaProperties && textureMetadata.width != textureMetadata.height) {
        const animation = metaProperties.animation as TextureAnimation;
        if (animation.frames === undefined) {
          continue;
        }

        texture.animated = true;

        const canvas = createCanvas(NORMALIZED_SIZE, NORMALIZED_SIZE);
        const ctx = canvas.getContext("2d");

        const image = (await loadImage(textureFile)) as unknown as Canvas;

        const pngFrames = [];
        const pngDelays = [];

        let currentTime = 0;

        for (const [index, frame] of animation.frames.entries()) {
          if (typeof frame == "number") {
            animation.frames[index] = {
              index: frame,
              time: animation.frametime
            };
          }

          animation.frames[index].time = (animation.frames[index].time / 20) * 1000;
          animation.frames[index].totalTime = currentTime;
          currentTime += animation.frames[index].time;
        }

        animation.frametime = (animation.frametime / 20) * 1000;

        if ("frames" in animation) {
          if (animation.interpolate) {
            let totalLength = 0;

            for (const frame of animation.frames) {
              totalLength += frame.time;
            }

            const frameTimeInterpolated = (2 / 20) * 1000;

            const frameCountInterpolated = totalLength / frameTimeInterpolated;

            for (let i = 0; i < frameCountInterpolated; i++) {
              let frameCur, frameNext;
              const currentTime = (i / frameCountInterpolated) * totalLength;

              for (const [index, frame] of animation.frames.entries()) {
                if (frame.totalTime && frame.totalTime + frame.time > currentTime) {
                  frameCur = frame;

                  if (index >= animation.frames.length - 1) {
                    frameNext = animation.frames[0];
                  } else {
                    frameNext = animation.frames[index + 1];
                  }

                  break;
                }
              }

              const opacity = frameCur && frameCur.totalTime ? (currentTime - frameCur.totalTime) / frameCur.time : 1;

              ctx.clearRect(0, 0, canvas.width, canvas.height);

              ctx.globalCompositeOperation = "source-over";

              ctx.globalAlpha = 1;
              ctx.drawImage(getFrame(image, frameCur ? frameCur.index : 0), 0, 0);

              ctx.globalCompositeOperation = "source-atop";

              ctx.globalAlpha = opacity;
              ctx.drawImage(getFrame(image, frameNext ? frameNext.index : 0), 0, 0);

              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer;

              pngFrames.push(imageData);
              pngDelays.push(frameTimeInterpolated);
            }
          } else {
            for (const frame of animation.frames) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(getFrame(image, frame.index), 0, 0);

              pngDelays.push(frame.time);

              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer;

              pngFrames.push(imageData);
            }
          }
        }

        if (pngFrames.length > 0) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          const apng = UPNG.encode(pngFrames, NORMALIZED_SIZE, NORMALIZED_SIZE, 0, pngDelays);

          await fs.writeFile(textureFile, Buffer.from(apng));

          try {
            if (fs.existsSync(textureFile.replace(".png", ".gif"))) {
              await execFile(apng2gif, [textureFile, "-o", textureFile.replace(".png", ".gif")]);
            } else {
              await execFile(apng2gif, [textureFile, "-o", textureFile]);
            }
          } catch (error) {
            console.log(error);
          }
        }
      }

      pack.textures.push(texture as ItemTexture);
    }

    console.log(`[CUSTOM-RESOURCES] Loaded ${format(pack.textures.length)} textures from ${pack.config.id}`);
  }
}

export function getPacks() {
  return outputPacks;
}

export function getCompletePacks() {
  return resourcePacks;
}

const skyblockIDTextureMap = new Map();
const textureValueTextureMap = new Map();
const itemIdTextureMap = new Map();
const headTextureMap = new Map();

const skyblockIDListMap = new Map();
const textureValueListMap = new Map();
const itemIdListMap = new Map();

const timeoutId = setTimeout(async () => {
  if (!resourcesReady) {
    await readyPromise;
  }

  for (const pack of resourcePacks) {
    for (const texture of pack.textures) {
      if (texture.skyblock_id !== undefined) {
        const key = `${pack.config.id}:${texture.skyblock_id}`;
        const data = skyblockIDTextureMap.get(key) ?? [];

        skyblockIDListMap.set(`${texture.skyblock_id}`, true);
        skyblockIDTextureMap.set(key, [...data, texture]);
      }

      const textureMatch = texture.match.filter((a) => a.value === "SkullOwner.Properties.textures.0.Value");
      if (textureMatch.length > 0) {
        const string = textureMatch[0].regex
          .replace(/^\/\^|\\=\\\$\/$/g, "")
          .replace(/\\\\/g, "\\")
          .replace("$/", "");

        const key = `${pack.config.id}:${string}`;
        const data = textureValueTextureMap.get(key) ?? [];

        textureValueListMap.set(`${string}`, true);
        textureValueTextureMap.set(key, [...data, texture]);
      }

      const itemId = texture.id;
      const damage = texture.damage ?? 0;
      if (itemId !== undefined) {
        // Skip PLAYER_SKULL, but keep MOB SKULLS (Skeleton, Zombie, etc.)
        if (itemId !== 397 || (itemId === 397 && [0, 1, 2, 4, 5].includes(damage))) {
          const key = `${pack.config.id}:${itemId}:${damage}`;
          const data = itemIdTextureMap.get(key) ?? [];

          itemIdListMap.set(`${itemId}:${damage}`, true);
          itemIdTextureMap.set(key, [...data, texture]);
        }
      }
      // else if (itemId !== undefined && itemId === 397) {
      //	const key = `${pack.config.id}:${itemId}:${damage}`;
      //	const data = headTextureMap.get(key) ?? [];
      //
      //	itemIdListMap.set(`${itemId}:${damage}`, true);
      //	headTextureMap.set(key, [...data, texture]);
      /// }
    }
  }

  for (const [key, value] of skyblockIDTextureMap) {
    skyblockIDTextureMap.set(
      key,
      value.sort((a: ItemTexture, b: ItemTexture) => b.weight - a.weight)
    );
  }

  for (const [key, value] of textureValueTextureMap) {
    textureValueTextureMap.set(
      key,
      value.sort((a: ItemTexture, b: ItemTexture) => b.weight - a.weight)
    );
  }

  for (const [key, value] of itemIdTextureMap) {
    itemIdTextureMap.set(
      key,
      value.sort((a: ItemTexture, b: ItemTexture) => b.weight - a.weight)
    );
  }

  for (const [key, value] of headTextureMap) {
    headTextureMap.set(
      key,
      value.sort((a: ItemTexture, b: ItemTexture) => b.weight - a.weight)
    );
  }

  clearTimeout(timeoutId);
}, 100);

const regexCache = new Map<string, RegExp>();
const memoizedResults = new Map<string, Partial<OutputTexture> | null>();
const removeFormattingRegex = /§[0-9a-fk-or]/g;

function processMatchValues(values: unknown[], regex: RegExp): boolean {
  const len = values.length;
  for (let i = 0; i < len; i++) {
    const str = values[i]?.toString().replace(removeFormattingRegex, "") ?? "";
    if (regex.test(str)) {
      return true;
    }
  }

  return false;
}

function processTexturesFast(outputTexture: Partial<OutputTexture>, textures: ItemTexture[], pack: ResourcePack, item: Item): Partial<OutputTexture> {
  const targetWeight = outputTexture.weight ?? -Infinity;

  if (!textures?.length || textures[0]?.weight < targetWeight) {
    return outputTexture;
  }

  const targetFile = outputTexture.file ?? "";
  const itemTags = new Map<string, unknown>();
  for (const texture of textures) {
    if (texture.weight < targetWeight || (texture.weight === targetWeight && texture.file < targetFile)) {
      continue;
    }

    let matches = 0;
    const requiredMatches = texture.match.length;
    for (const match of texture.match) {
      const value = match.value.endsWith(".*") ? match.value.slice(0, -2) : match.value;
      const valuePath = value.split(".");
      const tagKey = valuePath.join(".");

      let path = itemTags.get(tagKey);
      if (path === undefined) {
        if (!hasPath(item, "tag", ...valuePath)) {
          break;
        }

        path = getPath(item, "tag", ...valuePath);
        itemTags.set(tagKey, path);
      }

      let regex = regexCache.get(match.regex);
      if (!regex) {
        const slash = match.regex.lastIndexOf("/");
        regex = new RegExp(match.regex.slice(1, slash), match.regex.slice(slash + 1));
        regexCache.set(match.regex, regex);
      }

      const matchValues = Array.isArray(path) ? path : [path];
      if (processMatchValues(matchValues, regex)) {
        matches++;
      } else {
        break;
      }
    }

    if (matches === requiredMatches) {
      return { pack: { base_path: pack.base_path, config: pack.config }, ...texture };
    }
  }

  return outputTexture;
}

export function getTexture(item: ProcessedItem, { pack_ids = [], hotm = false }: getTextureParams = {}): Partial<OutputTexture> | null {
  const cacheKey = `${item.id}:${item.Damage ?? 0}:${getId(item)}:${getTextureValue(item as Item)}:${pack_ids.join(",")}`;
  const cached = memoizedResults.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  if (!hotm && ![skyblockIDListMap.has(getId(item)), textureValueListMap.has(getTextureValue(item as Item)), itemIdListMap.has(`${item.id}:${item.Damage ?? 0}`)].some(Boolean)) {
    memoizedResults.set(cacheKey, null);
    return null;
  }

  let outputTexture: Partial<OutputTexture> = { weight: -9999 };
  const packIdsSet = new Set(pack_ids);

  const uniquePacks = Array.from(new Map((pack_ids.length > 0 ? resourcePacks.filter((p) => !packIdsSet.has(p.config.id)) : resourcePacks).sort((a, b) => b.config.priority - a.config.priority).map((p) => [p.config.id, p])).values());
  for (const pack of uniquePacks) {
    const packId = pack.config.id;
    const textures = [skyblockIDTextureMap.get(`${packId}:${getId(item)}`), textureValueTextureMap.get(`${packId}:${getTextureValue(item as Item)}`), itemIdTextureMap.get(`${packId}:${item.id}:${item.Damage ?? 0}`)].filter(Boolean);

    for (const textureSet of textures) {
      outputTexture = processTexturesFast(outputTexture, textureSet, pack, item as Item);
      if (outputTexture.path) {
        break;
      }
    }

    if (outputTexture.path) {
      break;
    }
  }

  if (!outputTexture.path) {
    memoizedResults.set(cacheKey, null);
    return null;
  }

  outputTexture.path = "/" + path.relative(path.resolve(FOLDER_PATH, "static"), outputTexture.path as string);
  memoizedResults.set(cacheKey, outputTexture);
  return outputTexture;
}

const MAX_CACHE_SIZE = 10000;
setInterval(() => {
  if (memoizedResults.size > MAX_CACHE_SIZE) {
    const entries = Array.from(memoizedResults.entries());
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    for (const [key] of toDelete) {
      memoizedResults.delete(key);
    }
  }
}, 60000);
