import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";
import type { ProcessedItem } from "$types/stats.js";
import { getStatsFromItems } from "./stats";

export function getArmor(armor: ProcessedItem[]) {
  if (armor.some((a) => helper.getId(a) === "") === true) {
    return {
      armor: armor.filter((a) => helper.getId(a) !== "").reverse(),
      stats: {}
    };
  }

  if (armor.length === 1) {
    const armorPiece = armor.find((x) => x.rarity);
    if (armorPiece === undefined) {
      return {
        armor,
        set_name: "Unknown",
        set_rarity: "UNKNOWN"
      };
    }

    return {
      armor: armor.reverse(),
      stats: getStatsFromItems(armor),
      set_name: armorPiece.display_name,
      set_rarity: armorPiece.rarity
    };
  }

  if (armor.length === 4) {
    let outputName;
    let reforgeName;

    armor.forEach((armorPiece) => {
      let name = armorPiece.display_name;

      // Removing skin and stars / Whitelisting a-z and 0-9
      name = name.replace(/[^A-Za-z0-9 -']/g, "").trim();

      // Removing modifier
      if (armorPiece.tag?.ExtraAttributes?.modifier != undefined) {
        name = name.split(" ").slice(1).join(" ");
      }

      // Converting armor_name to generic name
      // Ex: Superior Dragon Helmet -> Superior Dragon Armor
      if (/^Armor .*? (Helmet|Chestplate|Leggings|Boots)$/g.test(name)) {
        // name starts with Armor and ends with piece name, remove piece name
        name = name.replaceAll(/(Helmet|Chestplate|Leggings|Boots)/g, "").trim();
      } else {
        // removing old 'Armor' and replacing the piece name with 'Armor'
        name = name.replace("Armor", "").replace("  ", " ").trim();
        name = name.replaceAll(/(Helmet|Chestplate|Leggings|Boots)/g, "Armor").trim();
      }

      armorPiece.armor_name = name;
    });

    // Getting full armor reforge (same reforge on all pieces)
    if (armor.filter((a) => a.tag?.ExtraAttributes?.modifier != undefined && a.tag?.ExtraAttributes?.modifier == armor[0].tag.ExtraAttributes.modifier).length == 4) {
      reforgeName = armor[0].display_name
        .replace(/[^A-Za-z0-9 -']/g, "")
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
