import { ITEMS } from "./constants";

function sortMuseumItems(museum: MuseumConstants, armorSetId: string) {
  return museum.armor_sets[armorSetId].sort((a: string, b: string) => {
    const aId = ITEMS.get(a)?.id;
    const bId = ITEMS.get(b)?.id;
    if (!aId || !bId) {
      return 0;
    }

    const priorityOrder = ["HAT", "HOOD", "HELMET", "CHESTPLATE", "TUNIC", "LEGGINGS", "TROUSERS", "SLIPPERS", "BOOTS", "NECKLACE", "CLOAK", "BELT", "GAUNTLET", "GLOVES"];

    return priorityOrder.findIndex((x) => aId.includes(x)) - priorityOrder.findIndex((x) => bId.includes(x));
  });
}

async function retrieveMuseumItems() {
  const timeNow = Date.now();
  // ! INFO: This is needed, the museum = { ... } doens't work for some reason?
  MUSEUM.armor_to_id = {};
  MUSEUM.armor_sets = {};
  MUSEUM.children = {};
  MUSEUM.weapons = [];
  MUSEUM.armor = [];
  MUSEUM.rarities = [];

  const museumItems = Array.from(ITEMS.values()).filter((item) => item.museum_data !== undefined);
  for (const item of museumItems) {
    if (!item.museum_data || !item.id) {
      continue;
    }

    const category = item.museum_data.type.toLowerCase() as keyof MuseumConstants;
    if (!MUSEUM[category]) {
      console.log(`[MUSEUM] Unknown museum category: ${category}`);
      continue;
    }

    if (["weapons", "rarities"].includes(category)) {
      (MUSEUM[category] as string[]).push(item.id);
    }

    if (item.museum_data.parent && Object.keys(item.museum_data.parent).length > 0) {
      const [parentKey, parentValue] = Object.entries(item.museum_data.parent)[0];
      MUSEUM.children[parentValue as string] = parentKey;
    }

    if (item.museum_data.armor_set_donation_xp) {
      const armorSetId = Object.keys(item.museum_data.armor_set_donation_xp)[0];
      if (!armorSetId) {
        console.log(`[MUSEUM] Invalid armor set donation XP for ${item.id}`);
        continue;
      }

      MUSEUM.armor_sets[armorSetId] ??= [];
      MUSEUM.armor_sets[armorSetId].push(item.id);

      sortMuseumItems(MUSEUM, armorSetId);

      MUSEUM.armor_to_id[armorSetId] = MUSEUM.armor_sets[armorSetId].at(0)!;

      MUSEUM.armor ??= [];
      if (!MUSEUM.armor.includes(armorSetId)) {
        MUSEUM.armor.push(armorSetId);
      }
    }
  }

  console.log(`[MUSEUM] Updated museum items in ${Date.now() - timeNow}ms`);
}

const MUSEUM: MuseumConstants = {
  armor_to_id: {},
  armor_sets: {},
  children: {},
  weapons: [],
  armor: [],
  rarities: [],
  getAllItems: function (): string[] {
    return this.weapons.concat(this.armor, this.rarities);
  }
};

export const MUSEUM_INVENTORY = {
  inventory: [
    {
      display_name: "Museum",
      rarity: "rare",
      texture_path: "/api/head/438cf3f8e54afc3b3f91d20a49f324dca1486007fe545399055524c17941f4dc",
      tag: {
        display: {
          Lore: ["§7The §9Museum §7is a compendium", "§7of all of your items in", "§7SkyBlock. Donate items to your", "§7Museum to unlock rewards.", "", "§7Other players can visit your", "§7Museum at any time! Display your", "§7best items proudly for all to", "§7see.", ""]
        }
      },
      position: 4,
      progressType: "total"
    },
    {
      display_name: "Weapons",
      texture_path: "/api/item/DIAMOND_SWORD",
      rarity: "uncommon",
      tag: {
        display: {
          Lore: ["§7View all of the §6Weapons §7that", "§7you have donated to the", "§7§9Museum§7!", ""]
        }
      },
      inventoryType: "weapons",
      containsItems: [],
      position: 19,
      progressType: "weapons"
    },
    {
      display_name: "Armor Sets",
      texture_path: "/api/item/DIAMOND_CHESTPLATE",
      rarity: "uncommon",
      tag: {
        display: {
          Lore: ["§7View all of the §9Armor Sets", "§9§7that you have donated to the", "§7§9Museum§7!", ""]
        }
      },
      position: 21,
      inventoryType: "armor",
      containsItems: [],
      progressType: "armor"
    },
    {
      display_name: "Rarities",
      rarity: "uncommon",
      texture_path: "/api/head/86addbd5dedad40999473be4a7f48f6236a79a0dce971b5dbd7372014ae394d",
      tag: {
        display: {
          Lore: ["§7View all of the §5Rarities", "§5§7that you have donated to the", "§7§9Museum§7!", ""]
        }
      },
      position: 23,
      inventoryType: "rarities",
      containsItems: [],
      progressType: "rarities"
    },
    {
      display_name: "Special Items",
      texture_path: "/api/item/CAKE",
      rarity: "uncommon",
      tag: {
        display: {
          Lore: ["§7View all of the §dSpecial Items", "§d§7that you have donated to the", "§7§9Museum§7!", "", "§7These items don't count towards", "§7Museum progress and rewards, but", "§7are cool nonetheless. Items that", "§7are §9rare §7and §6prestigious", "§6§7fit into this category, and", "§7can be displayed in the Main", "§7room of the Museum.", ""]
        }
      },
      position: 25,
      inventoryType: "special",
      containsItems: [],
      progressType: "special"
    },
    {
      display_name: "Museum Appraisal",
      texture_path: "/api/item/DIAMOND",
      rarity: "legendary",
      tag: {
        display: {
          Lore: ["§7§6Madame Goldsworth §7offers an", "§7appraisal service for Museums.", "§7When unlocked, she will appraise", "§7the value of your Museum each", "§7time you add or remove items.", "", "§7This service also allows you to", "§7appear on the §6Top Valued", "§6§7filter in the §9Museum", "§9Browser§7.", ""]
        }
      },
      position: 40,
      progressType: "appraisal"
    },
    {
      display_name: "Museum Rewards",
      texture_path: "/api/item/GOLD_BLOCK",
      rarity: "legendary",
      tag: {
        display: {
          Lore: ["§7Each time you donate an item to", "§7your Museum, the §bCurator", "§b§7will reward you.", "", "§7§dSpecial Items §7do not count", "§7towards your Museum rewards", "§7progress.", "", "§7Currently, most rewards are", "§7§ccoming soon§7, but you can", "§7view them anyway."]
        }
      },
      position: 48
    },
    {
      display_name: "Close",
      texture_path: "/api/item/BARRIER",
      rarity: "special",
      tag: {
        display: {
          Lore: []
        }
      },
      position: 49
    },
    {
      display_name: "Museum Browser",
      texture_path: "/api/item/SIGN",
      rarity: "uncommon",
      tag: {
        display: {
          Lore: ["§7View the Museums of your", "§7friends, top valued players, and", "§7more!"]
        }
      },
      position: 50
    }
  ],
  item_slots: [10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30, 31, 32, 33, 34, 37, 38, 39, 40, 41, 42, 43],
  missing_item: {
    weapons: {
      display_name: null,
      texture_path: "/api/item/INK_SACK:8",
      rarity: "special",
      tag: {
        display: {
          Lore: ["§7Click on this item in your", "§7inventory to add it to your", "§7§9Museum§7!"]
        }
      }
    },
    armor: {
      display_name: null,
      texture_path: "/api/item/INK_SACK:8",
      rarity: "special",
      tag: {
        display: {
          Lore: ["§7Click on an armor piece in your", "§7inventory that belongs to this", "§7armor set to donate the full set", "§7to your Museum."]
        }
      }
    },
    rarities: {
      display_name: null,
      texture_path: "/api/item/INK_SACK:8",
      rarity: "special",
      tag: {
        display: {
          Lore: ["§7Click on this item in your", "§7inventory to add it to your", "§7§9Museum§7!"]
        }
      }
    },
    special: null
  },
  higher_tier_donated: {
    display_name: null,
    texture_path: "/api/item/INK_SACK:10",
    rarity: "special",
    tag: {
      display: {
        Lore: ["§7Donated as higher tier"]
      }
    }
  }
};

export { MUSEUM };

setInterval(async () => await retrieveMuseumItems(), 1000 * 60 * 60 * 6); // 6 hours
retrieveMuseumItems();
