// CREDITS: https://github.com/MattTheCuber (Modified)
import { ITEMS } from "$lib/shared/constants/items";
import type { SpecialAccessory, SpecialAccessoryConstant, allAccessories } from "$types/stats";

let ACCESSORIES = [] as allAccessories[];
function getAccessories() {
  const output = [] as allAccessories[];
  ITEMS.forEach((item) => {
    if (item.category === "accessory") {
      output.push(item as allAccessories);
    }
  });

  ACCESSORIES = output;
}

setTimeout(getAccessories, 60 * 60 * 1000); // 1 hour
getAccessories();

const accessoryUpgrades = [
  ["WOLF_TALISMAN", "WOLF_RING"],
  ["POTION_AFFINITY_TALISMAN", "RING_POTION_AFFINITY", "ARTIFACT_POTION_AFFINITY"],
  ["FEATHER_TALISMAN", "FEATHER_RING", "FEATHER_ARTIFACT"],
  ["SEA_CREATURE_TALISMAN", "SEA_CREATURE_RING", "SEA_CREATURE_ARTIFACT"],
  ["HEALING_TALISMAN", "HEALING_RING"],
  ["CANDY_TALISMAN", "CANDY_RING", "CANDY_ARTIFACT", "CANDY_RELIC"],
  ["INTIMIDATION_TALISMAN", "INTIMIDATION_RING", "INTIMIDATION_ARTIFACT", "INTIMIDATION_RELIC"],
  ["SPIDER_TALISMAN", "SPIDER_RING", "SPIDER_ARTIFACT"],
  ["RED_CLAW_TALISMAN", "RED_CLAW_RING", "RED_CLAW_ARTIFACT"],
  ["HUNTER_TALISMAN", "HUNTER_RING"],
  ["ZOMBIE_TALISMAN", "ZOMBIE_RING", "ZOMBIE_ARTIFACT"],
  ["BAT_TALISMAN", "BAT_RING", "BAT_ARTIFACT"],
  ["BROKEN_PIGGY_BANK", "CRACKED_PIGGY_BANK", "PIGGY_BANK"],
  ["SPEED_TALISMAN", "SPEED_RING", "SPEED_ARTIFACT"],
  ["PERSONAL_COMPACTOR_4000", "PERSONAL_COMPACTOR_5000", "PERSONAL_COMPACTOR_6000", "PERSONAL_COMPACTOR_7000"],
  ["PERSONAL_DELETOR_4000", "PERSONAL_DELETOR_5000", "PERSONAL_DELETOR_6000", "PERSONAL_DELETOR_7000"],
  ["SCARF_STUDIES", "SCARF_THESIS", "SCARF_GRIMOIRE"],
  ["CAT_TALISMAN", "LYNX_TALISMAN", "CHEETAH_TALISMAN"],
  ["SHADY_RING", "CROOKED_ARTIFACT", "SEAL_OF_THE_FAMILY"],
  ["TREASURE_TALISMAN", "TREASURE_RING", "TREASURE_ARTIFACT"],
  ["BEASTMASTER_CREST_COMMON", "BEASTMASTER_CREST_UNCOMMON", "BEASTMASTER_CREST_RARE", "BEASTMASTER_CREST_EPIC", "BEASTMASTER_CREST_LEGENDARY"],
  ["RAGGEDY_SHARK_TOOTH_NECKLACE", "DULL_SHARK_TOOTH_NECKLACE", "HONED_SHARK_TOOTH_NECKLACE", "SHARP_SHARK_TOOTH_NECKLACE", "RAZOR_SHARP_SHARK_TOOTH_NECKLACE"],
  ["BAT_PERSON_TALISMAN", "BAT_PERSON_RING", "BAT_PERSON_ARTIFACT"],
  ["LUCKY_HOOF", "ETERNAL_HOOF"],
  ["WITHER_ARTIFACT", "WITHER_RELIC"],
  ["WEDDING_RING_0", "WEDDING_RING_2", "WEDDING_RING_4", "WEDDING_RING_7", "WEDDING_RING_9"],
  ["CAMPFIRE_TALISMAN_1", "CAMPFIRE_TALISMAN_4", "CAMPFIRE_TALISMAN_8", "CAMPFIRE_TALISMAN_13", "CAMPFIRE_TALISMAN_21"],
  ["JERRY_TALISMAN_GREEN", "JERRY_TALISMAN_BLUE", "JERRY_TALISMAN_PURPLE", "JERRY_TALISMAN_GOLDEN"],
  ["TITANIUM_TALISMAN", "TITANIUM_RING", "TITANIUM_ARTIFACT", "TITANIUM_RELIC"],
  ["BAIT_RING", "SPIKED_ATROCITY"],
  ["MASTER_SKULL_TIER_1", "MASTER_SKULL_TIER_2", "MASTER_SKULL_TIER_3", "MASTER_SKULL_TIER_4", "MASTER_SKULL_TIER_5", "MASTER_SKULL_TIER_6", "MASTER_SKULL_TIER_7"],
  ["SOULFLOW_PILE", "SOULFLOW_BATTERY", "SOULFLOW_SUPERCELL"],
  ["ENDER_ARTIFACT", "ENDER_RELIC"],
  ["POWER_TALISMAN", "POWER_RING", "POWER_ARTIFACT", "POWER_RELIC"],
  ["BINGO_TALISMAN", "BINGO_RING", "BINGO_ARTIFACT", "BINGO_RELIC"],
  ["BURSTSTOPPER_TALISMAN", "BURSTSTOPPER_ARTIFACT"],
  ["ODGERS_BRONZE_TOOTH", "ODGERS_SILVER_TOOTH", "ODGERS_GOLD_TOOTH", "ODGERS_DIAMOND_TOOTH"],
  ["GREAT_SPOOK_TALISMAN", "GREAT_SPOOK_RING", "GREAT_SPOOK_ARTIFACT"],
  ["DRACONIC_TALISMAN", "DRACONIC_RING", "DRACONIC_ARTIFACT"],
  ["BURNING_KUUDRA_CORE", "FIERY_KUUDRA_CORE", "INFERNAL_KUUDRA_CORE"],
  ["VACCINE_TALISMAN", "VACCINE_RING", "VACCINE_ARTIFACT"],
  ["WHITE_GIFT_TALISMAN", "GREEN_GIFT_TALISMAN", "BLUE_GIFT_TALISMAN", "PURPLE_GIFT_TALISMAN", "GOLD_GIFT_TALISMAN"],
  ["GLACIAL_TALISMAN", "GLACIAL_RING", "GLACIAL_ARTIFACT"],
  ["CROPIE_TALISMAN", "SQUASH_RING", "FERMENTO_ARTIFACT"],
  ["KUUDRA_FOLLOWER_ARTIFACT", "KUUDRA_FOLLOWER_RELIC"],
  ["AGARIMOO_TALISMAN", "AGARIMOO_RING", "AGARIMOO_ARTIFACT"],
  ["BLOOD_DONOR_TALISMAN", "BLOOD_DONOR_RING", "BLOOD_DONOR_ARTIFACT"],
  ["LUSH_TALISMAN", "LUSH_RING", "LUSH_ARTIFACT"],
  ["ANITA_TALISMAN", "ANITA_RING", "ANITA_ARTIFACT"],
  ["PESTHUNTER_BADGE", "PESTHUNTER_RING", "PESTHUNTER_ARTIFACT"],
  ["NIBBLE_CHOCOLATE_STICK", "SMOOTH_CHOCOLATE_BAR", "RICH_CHOCOLATE_CHUNK", "GANACHE_CHOCOLATE_SLAB", "PRESTIGE_CHOCOLATE_REALM"],
  ["IQ_POINT", "TWO_IQ_POINT"]
];

const ignoredAccessories = ["BINGO_HEIRLOOM", "LUCK_TALISMAN", "TALISMAN_OF_SPACE", "RING_OF_SPACE", "MASTER_SKULL_TIER_8", "MASTER_SKULL_TIER_9", "MASTER_SKULL_TIER_10", "COMPASS_TALISMAN", "ARTIFACT_OF_SPACE", "GRIZZLY_PAW", "ETERNAL_CRYSTAL", "OLD_BOOT", "ARGOFAY_TRINKET", "DEFECTIVE_MONITOR", "PUNCHCARD_ARTIFACT", "HARMONIOUS_SURGERY_TOOLKIT", "CRUX_TALISMAN_1", "CRUX_TALISMAN_2", "CRUX_TALISMAN_3", "CRUX_TALISMAN_4", "CRUX_TALISMAN_5", "CRUX_TALISMAN_6", "WARDING_TRINKET", "RING_OF_BROKEN_LOVE", "GARLIC_FLAVORED_GUMMY_BEAR", "CRUX_TALISMAN_7", "COMBO_MANIA_TALISMAN", "SATELITE", "RING_OF_ETERNAL_LOVE"];

export const ACCESSORY_ALIASES = {
  WEDDING_RING_0: ["WEDDING_RING_1"],
  WEDDING_RING_2: ["WEDDING_RING_3"],
  WEDDING_RING_4: ["WEDDING_RING_5", "WEDDING_RING_6"],
  WEDDING_RING_7: ["WEDDING_RING_8"],
  CAMPFIRE_TALISMAN_1: ["CAMPFIRE_TALISMAN_2", "CAMPFIRE_TALISMAN_3"],
  CAMPFIRE_TALISMAN_4: ["CAMPFIRE_TALISMAN_5", "CAMPFIRE_TALISMAN_6", "CAMPFIRE_TALISMAN_7"],
  CAMPFIRE_TALISMAN_8: ["CAMPFIRE_TALISMAN_9", "CAMPFIRE_TALISMAN_10", "CAMPFIRE_TALISMAN_11", "CAMPFIRE_TALISMAN_12"],
  CAMPFIRE_TALISMAN_13: ["CAMPFIRE_TALISMAN_14", "CAMPFIRE_TALISMAN_15", "CAMPFIRE_TALISMAN_16", "CAMPFIRE_TALISMAN_17", "CAMPFIRE_TALISMAN_18", "CAMPFIRE_TALISMAN_19", "CAMPFIRE_TALISMAN_20"],
  CAMPFIRE_TALISMAN_21: ["CAMPFIRE_TALISMAN_22", "CAMPFIRE_TALISMAN_23", "CAMPFIRE_TALISMAN_24", "CAMPFIRE_TALISMAN_25", "CAMPFIRE_TALISMAN_26", "CAMPFIRE_TALISMAN_27", "CAMPFIRE_TALISMAN_28", "CAMPFIRE_TALISMAN_29"],
  PARTY_HAT_CRAB: ["PARTY_HAT_CRAB_ANIMATED", "PARTY_HAT_SLOTH"],
  DANTE_TALISMAN: ["DANTE_RING"]
} as Record<string, string[]>;

const extraAccessories = [
  /*
  {
    id: "ID",
    texture: "TEXTURE",
    name: "NAME",
    rarity: "RARITY",
  },
  */
] as { id: string; texture: string; name: string; rarity: string }[];

export const SPECIAL_ACCESSORIES = {
  BOOK_OF_PROGRESSION: {
    allowsRecomb: false,
    rarities: ["uncommon", "rare", "epic", "legendary", "mythic"],
    customPrice: true
  },
  PANDORAS_BOX: {
    allowsRecomb: false,
    rarities: ["uncommon", "rare", "epic", "legendary", "mythic"],
    customPrice: true
  },
  TRAPPER_CREST: {
    rarities: ["uncommon"],
    customPrice: true
  },
  PULSE_RING: {
    rarities: ["rare", "epic", "legendary"],
    customPrice: true,
    upgrade: {
      item: "THUNDER_IN_A_BOTTLE",
      cost: {
        rare: 3,
        epic: 20,
        legendary: 100
      }
    }
  },
  POWER_RELIC: {
    rarities: ["legendary"],
    customPrice: true
  },
  RIFT_PRISM: {
    allowsRecomb: false
  },
  HOCUS_POCUS_CIPHER: {
    allowsEnrichment: false
  }
} as Record<string, SpecialAccessoryConstant>;

export function getAllAccessories() {
  const output = ACCESSORIES.reduce<allAccessories[]>((accessory, item) => {
    if (ignoredAccessories.includes(item.id)) return accessory;

    if (Object.values(ACCESSORY_ALIASES).find((list) => list.includes(item.id))) return accessory;

    accessory.push({
      ...item,
      id: item.id,
      texture_path: item.texture !== undefined ? `/api/head/${item.texture}` : `/api/item/${item.material}:${item.damage}`,
      item_id: item.item_id,
      damage: item.damage
    });

    const specialAccessory = SPECIAL_ACCESSORIES[item.id] as SpecialAccessory;
    if (specialAccessory?.rarities) {
      for (const rarity of specialAccessory.rarities) {
        accessory.push({
          ...item,
          ...specialAccessory,
          rarity: rarity,
          texture_path: item.texture !== undefined ? `/api/head/${item.texture}` : `/api/item/${item.material}:${item.damage}`
        });
      }
    }

    return accessory;
  }, []);

  return output.concat(extraAccessories);
}

function getMaxAccessories() {
  return getAllAccessories().filter((item) => {
    const list = accessoryUpgrades.find((list) => list.includes(item.id));

    return list === undefined || list.at(-1) === item.id;
  });
}

export const UNIQUE_ACCESSORIES_COUNT = new Set(getMaxAccessories().map((item) => item.id)).size;

export const MAGICAL_POWER = {
  common: 3,
  uncommon: 5,
  rare: 8,
  epic: 12,
  legendary: 16,
  mythic: 22,
  special: 3,
  very_special: 5
} as Record<string, number>;

export const RECOMBABLE_ACCESSORIES_COUNT = new Set(
  getMaxAccessories()
    .filter((a) => SPECIAL_ACCESSORIES[a.id]?.allowsRecomb !== false)
    .map((a) => a.id)
).size;

export function getUpgradeList(id: string) {
  return accessoryUpgrades.find((list) => list.includes(id)) ?? [];
}
