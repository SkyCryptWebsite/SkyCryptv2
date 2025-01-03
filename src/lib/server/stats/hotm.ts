import * as constants from "$lib/server/constants/constants";
import * as helper from "$lib/server/helper";
import { getLevelByXp } from "$lib/server/stats/leveling/leveling";
import type { Member, NodeData, ProcessedItem } from "$types/global";
import { calcHotmTokens } from "./mining";

export function getHotmItems(userProfile: Member, packs: string[]) {
  const data = userProfile.mining_core;
  if (!data) {
    return [];
  }

  const output = [] as ProcessedItem[];
  for (let index = 0; index < 10 * 9; index++) {
    output.push(helper.generateItem({}));
  }

  const hotmLevelData = getLevelByXp(data.experience, { type: "hotm" });
  const nodes = Object.fromEntries(Object.entries(data.nodes ?? {}).filter(([key]) => !key.startsWith("toggle_")));
  const toggles = Object.fromEntries(Object.entries(data.nodes ?? {}).filter(([key]) => key.startsWith("toggle_")));

  for (const nodeId in constants.HOTM.nodes) {
    const enabled = toggles[`toggle_${nodeId}`] === undefined;
    const level = nodes[nodeId] ?? 0;
    const node = new constants.HOTM.nodes[nodeId]({
      level,
      enabled,
      nodes,
      hotmLevelData,
      selectedPickaxeAbility: data.selected_pickaxe_ability
    } as unknown as NodeData);

    output[node.position10x9 - 1] = helper.generateItem({
      display_name: node.name,
      id: node.itemData.id,
      rarity: node.rarity,
      Damage: node.itemData.damage,
      glowing: node.itemData.glowing,
      tag: {
        display: {
          Name: node.displayName,
          Lore: node.lore
        },
        ExtraAttributes: {
          id: getHotMPerkId(node)
        }
      },
      position: node.position10x9
    } as ProcessedItem);
  }

  for (let tier = 1; tier <= constants.HOTM.tiers; tier++) {
    const hotm = new constants.HOTM.hotm(tier, hotmLevelData);

    output[hotm.position10x9 - 1] = helper.generateItem({
      display_name: `Tier ${tier}`,
      rarity: hotm.rarity,
      id: hotm.itemData.id,
      Damage: hotm.itemData.damage,
      glowing: hotm.itemData.glowing,
      tag: {
        display: {
          Name: hotm.displayName,
          Lore: hotm.lore
        },
        ExtraAttributes: {
          id: getHOTMLevelId(hotm)
        }
      },
      position: hotm.position10x9
    } as ProcessedItem);
  }

  for (const itemClass of constants.HOTM.items) {
    const item = new itemClass({
      resources: {
        token_of_the_mountain: calcHotmTokens(hotmLevelData.level, data.nodes?.special_0 ?? 0),
        mithril_powder: userProfile.mining_core.powder_mithril_total,
        gemstone_powder: userProfile.mining_core.powder_gemstone_total,
        glacite_powder: userProfile.mining_core.powder_glacite_total
      },
      crystals: userProfile.mining_core.crystals,
      last_reset: userProfile.mining_core.last_reset
    });

    output[item.position10x9 - 1] = helper.generateItem({
      display_name: helper.getRawLore(item.displayName),
      rarity: item.rarity,
      id: item.itemData.id,
      Damage: item.itemData.damage,
      glowing: item.itemData.glowing,
      texture_path: item.texture_path,
      tag: {
        display: {
          Name: item.displayName,
          Lore: item.lore
        },
        ExtraAttributes: {
          id: item.itemData.skyblock_id
        }
      },
      position: item.position10x9
    } as ProcessedItem);
  }

  output.forEach((item: ProcessedItem) => {
    helper.applyResourcePack(item, packs);
  });

  return output;
}

/**
 * Returns the level ID of a HOTM based on the progress. Created to improve performance by avoiding regex and string operations.
 * @param {Object} hotm - The HOTM object containing tier, level, xpCurrent, and xpForNext properties.
 * @returns {string} - The level ID of the HOTM.
 */
function getHOTMLevelId(hotm: { tier: number; level: number; xpCurrent: number; xpForNext: number }) {
  const progress = hotm.tier <= hotm.level ? 1 : hotm.level + 1 === hotm.tier ? hotm.xpCurrent / hotm.xpForNext : 0;
  if (hotm.tier === 1 || hotm.tier === 10) {
    return `hotm_level_${hotm.tier}_${getHOTMLvLTier(progress)}`;
  }

  return `hotm_level_${getHOTMLvLTier(progress)}`;
}

/**
 * Returns the HotM perk ID based on the given perk object.
 * @param {Object} perk - The perk object containing level and max_level properties.
 * @returns {string} - The HotM perk ID.
 */
function getHotMPerkId(perk: { level: number; max_level: number; positionType: string }) {
  const progress = perk.level / perk.max_level;

  return `hotm_perk_${perk.positionType}_${perk.positionType === "cross" ? Math.ceil(getHotMPerkTier(progress) / 2) : getHotMPerkTier(progress)}`;
}

function getHOTMLvLTier(progress: number) {
  const tiers = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.875, 1];
  if (progress === 0) {
    return 0;
  }

  for (let i = 0; i < tiers.length; i++) {
    if (progress < tiers[i]) {
      return i;
    }
  }
  return tiers.length;
}

function getHotMPerkTier(progress: number) {
  const tiers = [0.01, 0.125, 0.25, 0.375, 0.5, 0.625, 0.875, 1];
  if (progress === 0) {
    return 0;
  }

  for (let i = 0; i < tiers.length; i++) {
    if (progress < tiers[i]) {
      return i + 1;
    }
  }

  return 9;
}
