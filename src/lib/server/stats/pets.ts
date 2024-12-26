import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";
import { NEU_CONSTANTS, NEU_ITEMS } from "$lib/server/helper/NotEnoughUpdates/parseNEURepository";
import { formatNumber, uniqBy } from "$lib/shared/helper";
import type { Member, Pet, Pets, ProcessedItem, ProcessedPet, ProcessedSkyblockPet, Profile } from "$types/global";
import { getItemNetworth } from "skyhelper-networth";
import { stripItems } from "./items/stripping";

let getMaxPetIdsCache = {} as { lastUpdated: number; data: Record<string, number> };
function getMaxPetIds() {
  if (Date.now() - getMaxPetIdsCache.lastUpdated < 12 * 60 * 60 * 1000) {
    return getMaxPetIdsCache.data;
  }

  const petIds = [] as string[];
  const petNumsIds = Object.keys(NEU_CONSTANTS.get("petnums"));
  NEU_ITEMS.forEach((_item, id) => {
    if (id.includes(";") && petNumsIds.includes(id.split(";")[0])) {
      petIds.push(constants.PET_PARENTS[id.split(";")[0]] ?? id);
    }
  });

  const maxPetIds = petIds
    .filter((id, index) => petIds.indexOf(id) === index)
    .reduce(
      (acc, id) => {
        const [type, rarity] = id.split(";");

        acc[type] = Math.max(parseInt(rarity), acc[type] ?? 0);
        return acc;
      },
      {} as Record<string, number>
    );

  getMaxPetIdsCache = { lastUpdated: Date.now(), data: maxPetIds };

  return maxPetIds;
}

const getPetSkinCache = {} as { lastUpdated: number; data: string[] };
function getPetSkins() {
  if (Date.now() - getPetSkinCache.lastUpdated < 12 * 60 * 60 * 1000) {
    return getPetSkinCache.data;
  }

  getPetSkinCache.data = [];
  getPetSkinCache.lastUpdated = Date.now();
  for (const skin of NEU_ITEMS.keys()) {
    if (skin.startsWith("PET_SKIN") === false) {
      continue;
    }

    getPetSkinCache.data.push(skin);
  }

  return getPetSkinCache.data;
}

function replaceVariables(template: string, variables: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, name) => variables[name] ?? match);
}

function getPetLevel(petExp: number, type: string, rarity: string) {
  const petData = NEU_CONSTANTS.get("pets");

  const rarityOffset = petData.custom_pet_leveling[type]?.rarity_offset?.[rarity] ?? petData.pet_rarity_offset[rarity];

  const maxLevel = petData.custom_pet_leveling[type]?.max_level ?? 100;

  const levels = petData.pet_levels.slice(rarityOffset, rarityOffset + maxLevel - 1).concat(petData.custom_pet_leveling[type]?.pet_levels ?? []);

  let level = 1;
  let xpMaxLevel = 0;
  let currentXp = 0;
  for (let i = 0; i < maxLevel - 1; i++) {
    xpMaxLevel += levels[i];
    if (xpMaxLevel <= petExp) {
      level++;
      currentXp = petExp - xpMaxLevel;
    }
  }

  const xpForNext = levels[level - 1] ?? null;
  const progress = isNaN(currentXp / xpForNext) ? 0 : currentXp / xpForNext;

  return {
    xp: petExp,
    level,
    currentXp,
    xpForNext,
    progress,
    xpMaxLevel
  };
}

function getPetData(level: number, type: string, rarity: string) {
  const petNums = NEU_CONSTANTS.get("petnums");
  if (petNums[type] === undefined || petNums[type][rarity] === undefined) {
    return null;
  }

  const lvlMin = petNums[type][rarity]["1"];
  const lvlMax = petNums[type][rarity]["100"];
  if (lvlMin === undefined || lvlMax === undefined) {
    return {};
  }

  const statPerLevel = (Math.min(level, 100) - 1) / (100 - 1);
  const output = { ...lvlMin.statNums, ...lvlMax.otherNums };

  for (const key in output) {
    const lowStat = lvlMin.statNums[key] ?? lvlMin.otherNums[key];
    const highStat = lvlMax.statNums[key] ?? lvlMax.otherNums[key];

    output[key] = helper.round(lowStat + (highStat - lowStat) * statPerLevel, 2);
  }

  return output;
}

function getProfilePets(pets: Pet[]) {
  let output = [] as ProcessedPet[];
  if (pets === undefined) {
    return output;
  }

  for (const pet of pets) {
    if ("tier" in pet === false) {
      continue;
    }

    const outputPet = {
      type: pet.type,
      display_name: helper.titleCase(pet.type.replaceAll("_", " ")),
      rarity: pet.tier,
      active: pet.active,
      price: pet.price,
      level: getPetLevel(pet.exp, pet.type, pet.tier.toUpperCase()),
      texture_path: "/api/head/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40",
      lore: ["§cThis pet is not saved in the repository", "", "§cIf you expected it to be there please send a message in", "§c§l#neu-support §r§con §ldiscord.gg/moulberry"],
      stats: {},
      candyUsed: pet.candyUsed,
      skin: pet.skin
    } as ProcessedPet;

    const NEUItemId = `${pet.type};${constants.RARITIES.indexOf(pet.tier.toLowerCase())}`;
    const NEUItemIdFallback = pet.heldItem === "PET_ITEM_TIER_BOOST" ? `${pet.type};${constants.RARITIES.indexOf(pet.tier.toLowerCase()) - 1}` : null;
    const petData = NEU_ITEMS.get(NEUItemId) ?? NEU_ITEMS.get(NEUItemIdFallback as string);
    if (petData === undefined) {
      output.push(outputPet);
      continue;
    }

    const skinData = pet.skin ? NEU_ITEMS.get(`PET_SKIN_${pet.skin}`) : null;
    const texture = skinData ? helper.getHeadTextureUUID(skinData.nbttag.SkullOwner.Properties.textures[0].Value) : helper.getHeadTextureUUID(petData.nbttag.SkullOwner.Properties.textures[0].Value);

    outputPet.texture_path = `/api/head/${texture}?v6`;

    let data = getPetData(outputPet.level.level, pet.type, pet.tier.toUpperCase());
    if (!data && pet.heldItem === "PET_ITEM_TIER_BOOST") {
      data = getPetData(outputPet.level.level, pet.type, constants.RARITIES[constants.RARITIES.indexOf(pet.tier.toLowerCase()) - 1].toUpperCase());
    }

    data ??= {};
    Object.assign(data, { LVL: outputPet.level.level });

    outputPet.stats = Object.keys(data)
      .filter((a) => a.length > 1 && a !== "LVL")
      .reduce(
        (acc, key) => {
          acc[key.toLowerCase()] = data[key];
          return acc;
        },
        {} as Record<string, number>
      );

    outputPet.display_name = replaceVariables(petData.displayname, data);
    outputPet.lore = [];
    for (const line of petData.lore) {
      if (line.startsWith("§7§eRight-click to add this pet to")) {
        break;
      }

      outputPet.lore.push(replaceVariables(line, data));
    }

    if (pet.heldItem) {
      const petItem = NEU_ITEMS.get(pet.heldItem);
      if (petItem !== undefined) {
        let spaces = 0;
        outputPet.lore.push(``, `§6Held item: ${petItem.displayname}`);
        for (const description of petItem.lore) {
          if (description.trim() === "") {
            spaces++;
          } else if (spaces === 2) {
            outputPet.lore.push(description);
          } else if (spaces > 2) {
            break;
          }
        }
      } else {
        if ((outputPet.lore.at(-1) ?? "").trim() !== "") {
          outputPet.lore.push("");
        }

        outputPet.lore.push(
          `§6Held item: ${pet.heldItem
            .toLowerCase()
            .split("_")
            .map((a) => helper.titleCase(a))
            .join(" ")}`
        );
        outputPet.lore.push(`§cCould not find held item in Not Enough Updates repository.`);
      }
    }

    if (outputPet.level.xp >= outputPet.level.xpMaxLevel) {
      outputPet.lore.push(``, `§bMAX LEVEL`);
    } else {
      outputPet.lore.push(`§7Progress to Level ${outputPet.level.level + 1}: §e${(outputPet.level.progress * 100).toFixed(1)}%`);

      const progress = Math.ceil(outputPet.level.progress * 20);
      const numerator = Math.floor(outputPet.level.currentXp).toLocaleString();
      const denominator = formatNumber(outputPet.level.xpForNext);

      outputPet.lore.push(`§2${"-".repeat(progress)}§f${"-".repeat(20 - progress)} §e${numerator} §6/ §e${denominator}`);
    }

    outputPet.lore.push(``, `§7Total XP: §e${formatNumber(outputPet.level.xp, 1)} §6/ §e${formatNumber(outputPet.level.xpMaxLevel)} §6(100%)`, `§7Candy Used: §e${pet.candyUsed ?? 0} §6/ §e10`);

    if (outputPet.price && outputPet.price > 0) {
      outputPet.lore.push(``, `§7Item Value: §6${Math.floor(outputPet.price).toLocaleString()} Coins §7(§6${formatNumber(outputPet.price)}§7)`);
    }

    outputPet.lore = outputPet.lore.filter((line, index, self) => {
      const prevLine = self[index - 1] || "";

      return !(line.trim() === "" && prevLine.trim() === "");
    });

    output.push(outputPet);
  }

  output = output.sort((a, b) => {
    if (a.active === b.active) {
      if (a.rarity == b.rarity) {
        if (a.type == b.type) {
          return a.level.level > b.level.level ? -1 : 1;
        } else {
          const maxPetA = output.filter((x) => x.type == a.type && x.rarity == a.rarity).sort((x, y) => y.level.level - x.level.level) as ProcessedPet[];

          const maxPetALevel = maxPetA.length > 0 ? maxPetA[0].level.level : 0;

          const maxPetB = output.filter((x) => x.type == b.type && x.rarity == b.rarity).sort((x, y) => y.level.level - x.level.level);

          const maxPetBLevel = maxPetB.length > 0 ? maxPetB[0].level.level : 0;

          if (maxPetALevel && maxPetBLevel && maxPetALevel == maxPetBLevel) {
            return a.type < b.type ? -1 : 1;
          } else {
            return maxPetALevel > maxPetBLevel ? -1 : 1;
          }
        }
      } else {
        return constants.RARITIES.indexOf(a.rarity.toLowerCase()) < constants.RARITIES.indexOf(b.rarity.toLowerCase()) ? 1 : -1;
      }
    }

    return a.active ? -1 : 1;
  });

  return output;
}

function getMissingPets(pets: ProcessedPet[], gameMode: string) {
  const ownedPetTypes = pets.map((pet) => pet.type);

  const missingPets = [];
  const maxPetIds = getMaxPetIds();
  for (const pet of Object.keys(NEU_CONSTANTS.get("petnums"))) {
    if (ownedPetTypes.includes(pet) || (pet === "BINGO" && gameMode !== "bingo")) {
      continue;
    }

    const rarityIndex = maxPetIds[pet];
    if (rarityIndex === undefined) {
      continue;
    }

    missingPets.push({
      type: pet,
      active: false,
      exp: (NEU_CONSTANTS.get("pets").custom_pet_leveling[pet]?.pet_levels ?? NEU_CONSTANTS.get("pets").pet_levels).reduce((a: number, b: number) => a + b, 0) * 100,
      tier: constants.RARITIES[rarityIndex].toUpperCase(),
      candyUsed: 0,
      heldItem: null,
      skin: null
    });
  }

  return getProfilePets(missingPets as unknown as Pet[]);
}

function getPetScore(pets: ProcessedPet[]) {
  const highestRarity = {} as Record<string, number>;
  const highestLevel = {} as Record<string, number>;

  const petData = NEU_CONSTANTS.get("pets");
  for (const pet of pets) {
    const rarityIndex = constants.RARITIES.indexOf(pet.rarity.toLowerCase()) + 1;
    if (rarityIndex > (highestRarity[pet.type] ?? 0)) {
      highestRarity[pet.type] = rarityIndex;
    }

    if (pet.level.level > (highestLevel[pet.type] ?? 0)) {
      const maxLevel = petData.custom_pet_leveling[pet.type]?.max_level ?? 100;
      if (pet.level.level < maxLevel) {
        continue;
      }

      highestLevel[pet.type] = 1;
    }
  }

  const total = Object.values(highestRarity).reduce((a, b) => a + b, 0) + Object.values(highestLevel).reduce((a, b) => a + b, 0);

  let bonus = {} as Record<string, number>;
  for (const score of Object.keys(constants.PET_REWARDS).reverse()) {
    if (parseInt(score) > total) {
      continue;
    }

    bonus = Object.assign({}, constants.PET_REWARDS[score as unknown as number]);
    break;
  }

  const petScores = Object.keys(constants.PET_REWARDS).map(Number);
  return {
    amount: total,
    stats: bonus,
    reward: Object.entries(constants.PET_REWARDS).map(([score, stats]) => {
      const output = {
        score: parseInt(score),
        bonus: Object.values(stats).reduce((a, b) => a + b, 0)
      } as { score: number; bonus: number; unlocked?: boolean };

      if (parseInt(score) === Math.max(...petScores.filter((s) => s <= total))) {
        output.unlocked = true;
      }

      return output;
    })
  };
}

export async function getPets(userProfile: Member, items: ProcessedItem[], profile: Profile) {
  const output = {} as Pets;

  const allPets = JSON.parse(JSON.stringify(userProfile.pets_data?.pets ?? [])) as Pet[];
  if (items !== undefined) {
    allPets.push(...(items as unknown as Pet[]));
  }

  if (userProfile.rift?.dead_cats?.montezuma !== undefined) {
    const montezumaPet = userProfile.rift.dead_cats.montezuma;
    montezumaPet.active = false;

    allPets.push(montezumaPet);
  }

  const pets = allPets.filter((pet) => pet.exp !== undefined);
  if (pets.length === 0) {
    return {};
  }

  for (const pet of pets) {
    await getItemNetworth(pet, { cache: true, returnItemData: false });
  }

  output.pets = getProfilePets(pets) as unknown as ProcessedSkyblockPet[];
  output.missing = getMissingPets(output.pets as unknown as ProcessedPet[], profile.game_mode) as unknown as ProcessedSkyblockPet[];

  const maxPetIds = getMaxPetIds();
  output.amount = uniqBy(output.pets, "type").length;
  const totalPets = profile.game_mode === "bingo" ? Object.keys(maxPetIds) : Object.keys(maxPetIds).filter((pet) => pet !== "BINGO");
  output.total = totalPets.length;

  output.amountSkins = uniqBy(output.pets, "skin").length;
  output.totalSkins = getPetSkins().length;

  output.petScore = getPetScore(output.pets as unknown as ProcessedPet[]);
  output.totalPetExp = (output.pets as unknown as ProcessedPet[]).reduce((a, b) => a + b.level.xp, 0);
  output.totalCandyUsed = (output.pets as unknown as ProcessedPet[]).reduce((a, b) => a + b.candyUsed, 0);

  output.pets = stripItems(output.pets as unknown as ProcessedPet[]) as unknown as ProcessedSkyblockPet[];
  output.missing = stripItems(output.missing as unknown as ProcessedPet[]) as unknown as ProcessedSkyblockPet[];

  return output;
}
