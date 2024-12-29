import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";
import type { ProcessedItem } from "$types/stats";
import { getStatsFromItems } from "./stats";

export function getArmor(armor: ProcessedItem[]) {
  if (armor.every((a) => !helper.getId(a).length)) {
    return {
      armor: [],
      stats: {}
    };
  }

  // One armor piece
  if (armor.length === 1) {
    const armorPiece = armor.find((x) => x.rarity);
    if (!armorPiece) {
      return {
        armor: armor.reverse(),
        stats: getStatsFromItems(armor)
      };
    }

    return {
      armor: armor.reverse(),
      stats: getStatsFromItems(armor),
      set_name: armorPiece.display_name,
      set_rarity: armorPiece.rarity
    };
  }

  // Full armor set (4 pieces)
  if (armor.length === 4) {
    let outputName;
    let reforgeName;

    // Getting armor_name
    armor.forEach((armorPiece) => {
      let name = armorPiece.display_name ?? "";

      // Removing Unicode characters first
      name = name.replace(/§[0-9a-fk-or]/g, "");
      // Then removing Minecraft color codes
      // eslint-disable-next-line no-control-regex
      name = name.replace(/[^\x00-\x7F]/g, "").trim();

      // Removing modifier
      if (armorPiece.tag?.ExtraAttributes?.modifier != undefined) {
        name = name.split(" ").slice(1).join(" ");
      }

      // Converting armor_name to generic name
      if (/^Armor .*? (Helmet|Chestplate|Leggings|Boots)$/g.test(name)) {
        name = name.replaceAll(/(Helmet|Chestplate|Leggings|Boots)/g, "").trim();
      } else {
        name = name.replace("Armor", "").replace("  ", " ").trim();
        name = name.replaceAll(/(Helmet|Chestplate|Leggings|Boots)/g, "Armor").trim();
      }

      armorPiece.armor_name = name;
    });

    // Getting full armor reforge (same reforge on all pieces)
    if (armor.filter((a) => a.tag?.ExtraAttributes?.modifier != undefined && a.tag?.ExtraAttributes?.modifier == armor[0].tag.ExtraAttributes.modifier).length == 4) {
      reforgeName = armor[0].display_name
        .replace(/§[0-9a-fk-or]/g, "")
        // eslint-disable-next-line no-control-regex
        .replace(/[^\x00-\x7F]/g, "")
        .trim()
        .split(" ")[0];
    }

    // Handling normal sets of armor
    if (armor.filter((a) => a.armor_name == armor[0].armor_name).length == 4) {
      outputName = armor[0].armor_name;
    }

    // Handling special sets of armor (where pieces aren't named the same)
    constants.SPECIAL_SETS.forEach((set) => {
      if (armor.filter((a) => set.pieces.includes(helper.getId(a))).length == 4) {
        outputName = set.name;
      }
    });

    if (reforgeName && outputName) {
      outputName = reforgeName + " " + outputName;
    }

    return {
      armor: armor.reverse(),
      stats: getStatsFromItems(armor),
      set_name: outputName,
      set_rarity: constants.RARITIES[Math.max(...armor.map((a) => helper.rarityNameToInt(a.rarity ?? "common")))]
    };
  }

  return {
    armor: armor.reverse(),
    stats: getStatsFromItems(armor)
  };
}
