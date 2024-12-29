import { getBonusStat } from "$lib/shared/constants/stats";
import type { ValidStats } from "$types/global";

export function getPlayerStats(profile: ValidStats) {
  const stats = {
    health: { base: 100 },
    defense: { base: 0 },
    strength: { base: 0 },
    speed: { base: 100 },
    critical_chance: { base: 30 },
    critical_damage: { base: 50 },
    intelligence: { base: 0 },
    bonus_attack_speed: { base: 0 },
    sea_creature_chance: { base: 20 },
    magic_find: { base: 0 },
    pet_luck: { base: 0 },
    true_defense: { base: 0 },
    ferocity: { base: 0 },
    ability_damage: { base: 0 },
    mining_speed: { base: 0 },
    mining_fortune: { base: 0 },
    farming_fortune: { base: 0 },
    foraging_fortune: { base: 0 },
    pristine: { base: 0 },
    fishing_speed: { base: 0 },
    health_regen: { base: 100 },
    vitality: { base: 100 },
    mending: { base: 100 },
    combat_wisdom: { base: 0 },
    mining_wisdom: { base: 0 },
    farming_wisdom: { base: 0 },
    foraging_wisdom: { base: 0 },
    fishing_wisdom: { base: 0 },
    enchanting_wisdom: { base: 0 },
    alchemy_wisdom: { base: 0 },
    carpentry_wisdom: { base: 0 },
    runecrafting_wisdom: { base: 0 },
    social_wisdom: { base: 0 },
    mining_spread: { base: 0 },
    gemstone_spread: { base: 0 },
    ore_fortune: { base: 0 },
    block_fortune: { base: 0 },
    dwarven_metal_fortune: { base: 0 },
    gemstone_fortune: { base: 0 },
    wheat_fortune: { base: 0 },
    carrot_fortune: { base: 0 },
    potato_fortune: { base: 0 },
    pumpkin_fortune: { base: 0 },
    melon_fortune: { base: 0 },
    mushroom_fortune: { base: 0 },
    cactus_fortune: { base: 0 },
    sugar_cane_fortune: { base: 0 },
    nether_wart_fortune: { base: 0 },
    cocoa_beans_fortune: { base: 0 },
    double_hook_chance: { base: 0 },
    trophy_fish_chance: { base: 0 },
    heat_resistance: { base: 0 },
    fear: { base: 0 }
  } as Record<string, { base: number; [string: string]: number }>;

  if (profile.skyblock_level.level > 0) {
    stats.health.skyblock_level = profile.skyblock_level.level * 5;
    stats.strength.skyblock_level = Math.floor(profile.skyblock_level.level / 5);
  }

  if (profile.items.armor.stats) {
    const armorStats = profile.items.armor.stats;
    for (const key of Object.keys(armorStats)) {
      if (key in stats) {
        stats[key].armor = armorStats[key] ?? 0;
      }
    }
  }

  if (profile.items.equipment.stats) {
    const equipmentStats = profile.items.equipment.stats;
    for (const key of Object.keys(equipmentStats)) {
      if (key in stats === false) {
        continue;
      }

      stats[key].equipment = equipmentStats[key] ?? 0;
    }
  }

  if (profile.skills.skills) {
    for (const [skill, data] of Object.entries(profile.skills.skills)) {
      const bonusStats = getBonusStat(data.level, `skill_${skill}`, data.maxLevel);

      for (const [name, value] of Object.entries(bonusStats)) {
        if (name in stats === false) {
          continue;
        }

        stats[name][`skill_${skill}`] ??= 0;
        stats[name][`skill_${skill}`] += value;
      }
    }
  }

  if (profile.pets.pets) {
    const activePet = profile.pets.pets.find((pet) => pet.active);
    if (activePet) {
      for (const [stat, value] of Object.entries(activePet.stats ?? {})) {
        if (stat in stats === false && value) {
          continue;
        }

        stats[stat].active_pet = value ?? 0;
      }
    }
  }

  if (profile.slayer?.data) {
    for (const [slayer, data] of Object.entries(profile.slayer.data)) {
      const bonusStats = getBonusStat(data.level.level, `slayer_${slayer}`, data.level.maxLevel);

      for (const [name, value] of Object.entries(bonusStats)) {
        if (name in stats === false) {
          continue;
        }

        stats[name][`slayer_${slayer}`] ??= 0;
        stats[name][`slayer_${slayer}`] += value;
      }
    }
  }

  if (profile.dungeons?.level?.level) {
    const bonusStats = getBonusStat(profile.dungeons.level.level, "skill_dungeoneering", 50);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (name in stats === false) {
        continue;
      }

      stats[name].skill_dungeoneering = value;
    }
  }

  if (profile.bestiary.level > 0) {
    stats.health.bestiary = Math.floor(profile.bestiary.level);
  }

  if (profile.pets.petScore && profile.pets.petScore.stats.magic_find > 0) {
    stats.magic_find.pet_score = profile.pets.petScore.stats.magic_find;
  }

  if (profile.accessories.stats) {
    const accessoryStats = profile.accessories.stats;
    for (const key of Object.keys(accessoryStats)) {
      if (key in stats === false) {
        continue;
      }

      stats[key].accessories = accessoryStats[key] ?? 0;
    }
  }

  for (const [key, value] of Object.entries(stats)) {
    stats[key].total = value.base;

    for (const [name, val] of Object.entries(value)) {
      if (name === "base" || name === "total") {
        continue;
      }

      stats[key].total += val;
    }
  }

  return stats;
}
