import { gameModeIcons } from "$src/lib/shared/constants/game-modes";
import { formatDistanceToNowStrict } from "date-fns";
import type { ModelsEmbedData } from "#lib/shared/api/orval-generated";
import { formatNumber } from "#lib/shared/helper";

const skillEmojis = {
  combat: "<:combat:1558225211923636315>",
  carpentry: "<:carpentry:1558225210753163354>",
  berserk: "<:berserk:1558225207322476544>",
  archer: "<:archer:1558225204704976966>",
  alchemy: "<:alchemy:1558225203379703858>",
  tank: "<:tank:1558225242030346390>",
  taming: "<:taming:1558225240402690068>",
  social: "<:social:1558225237189857442>",
  runecrafting: "<:runecrafting:1558225233180237984>",
  mining: "<:mining:1558225228235018271>",
  hunting: "<:hunting:1558225223621283921>",
  healer: "<:healer:1558225222702866442>",
  foraging: "<:foraging:1558225221247303880>",
  fishing: "<:fishing:1558225219745878036>",
  farming: "<:farming:1558225218567147651>",
  enchanting: "<:enchanting:1558225216164069436>",
  dungeons: "<:dungeons:1558225214444150794>",
  dungeoneering: "<:dungeoneering:1558225213223866399>",
  mage: "<:mage:1558225227039637624>"
} as const;

type SkillKey = keyof typeof skillEmojis;

const slayerEmojis = {
  blaze: "<:blaze:1558225209226559529>",
  zombie: "<:zombie:1558225246945939527>",
  wolf: "<:wolf:1558225245532463225>",
  vampire: "<:vampire:1558225244207063050>",
  spider: "<:spider:1558225239299727380>",
  enderman: "<:enderman:1558225217422102618>"
} as const;

const miscEmojis = {
  bank: "<:bank:1558225205909000202>",
  slayyyter: "<:slayyyter:1558225235713593354>",
  skills: "<:skills:1558225234547580948>",
  crank: "<:crank:1558225232030994614>",
  purse: "<:purse:1558225230613450814>",
  networth: "<:networth:1558225229418074112>",
  level: "<:level:1558225225768767530>"
} as const;

function getLongDescription(embedData: ModelsEmbedData): string {
  if (!embedData || !embedData.username) {
    return "";
  }

  const lines: string[] = [];

  // Profile Header
  if (embedData.skyblock_level) {
    lines.push(`${miscEmojis.level} Level: ${formatNumber(embedData.skyblock_level)}`);
  }

  // Financials
  const hasFinancials = embedData.networth?.normal != null || embedData.purse != null || embedData.bank != null;
  if (hasFinancials && lines.length > 0) {
    lines.push("");
  }

  if (embedData.networth?.normal != null) {
    lines.push(`${miscEmojis.networth} Networth: ${formatNumber(embedData.networth.normal)}`);
  }

  if (embedData.purse != null) {
    lines.push(`${miscEmojis.purse} Purse: ${formatNumber(embedData.purse)}`);
  }

  if (embedData.bank != null) {
    lines.push(`${miscEmojis.bank} Bank: ${formatNumber(embedData.bank)}`);
  }

  // Skills
  const skills = embedData.skills?.skills;
  if (embedData.skills && skills && Object.keys(skills).length > 0) {
    lines.push(`\n${miscEmojis.skills} **Skill Average: ${embedData.skills.skillAverage}**`);
    lines.push("-# ~~                                              ~~");

    const skillsOrder: SkillKey[][] = [
      ["combat", "farming", "fishing", "mining", "foraging", "enchanting"],
      ["alchemy", "carpentry", "runecrafting", "taming", "social", "hunting"]
    ];

    for (const skillGroup of skillsOrder) {
      const row = skillGroup
        .filter((skill) => skills[skill as keyof typeof skills] != null)
        .map((skill) => `${skillEmojis[skill]} ${skills[skill as keyof typeof skills]}`)
        .join(" ︲ ");

      if (row.length > 0) {
        lines.push(row);
      }
    }
  }

  // Dungeons
  if (embedData.dungeons && embedData.dungeons.classAverage && embedData.dungeons.classAverage) {
    const classAverage = embedData.dungeons.classAverage;
    if (classAverage) {
      lines.push(`\n${skillEmojis.dungeons} **Class Average: ${classAverage}**`);
      lines.push("-# ~~                                              ~~");
    }

    const dungeonEntries: string[] = [`${skillEmojis.dungeoneering} ${embedData.dungeons.dungeoneering ?? 0}`];

    const classes = embedData.dungeons.classes;
    const classOrder: SkillKey[] = ["healer", "mage", "berserk", "archer", "tank"];
    if (classes) {
      for (const dclass of classOrder) {
        const level = classes[dclass as keyof typeof classes];
        if (level != null) {
          const emoji = skillEmojis[dclass];
          dungeonEntries.push(`${emoji} ${level}`);
        }
      }
    }

    lines.push(dungeonEntries.join(" ︲ "));
  }

  // Slayer
  if (embedData.slayers && embedData.slayers.xp != null && embedData.slayers.xp > 0) {
    lines.push(`\n${miscEmojis.slayyyter} **Slayer XP: ${formatNumber(embedData.slayers.xp)}**`);
    lines.push("-# ~~                                              ~~");

    if (embedData.slayers.slayers) {
      const slayerOrder = ["zombie", "spider", "wolf", "enderman", "vampire", "blaze"] as const;
      const items: string[] = [];

      for (const slayer of slayerOrder) {
        const level = embedData.slayers.slayers[slayer];
        if (level) {
          items.push(`${slayerEmojis[slayer]} ${level}`);
        }
      }

      if (items.length > 0) {
        lines.push(items.join(" ︲ "));
      }
    }
  }

  return lines.join("\n").trim() + "\n";
}

function getMetaTitle(embedData: ModelsEmbedData): string {
  if (!embedData || !embedData.username) {
    return "";
  }

  const gameModeIcon = gameModeIcons[embedData.game_mode as keyof typeof gameModeIcons] ?? "";
  return `${embedData.username} (${embedData.profile_cute_name} ${gameModeIcon})`.trim();
}

function getShortDescription(embedData: ModelsEmbedData): string {
  if (!embedData.joined) {
    return "";
  }

  return `${embedData.username} has been playing SkyBlock for ${formatDistanceToNowStrict(new Date(embedData.joined))}`;
}

function getGenericDescription(embedData: ModelsEmbedData): string {
  if (!embedData || !embedData.username) {
    return "A beautiful site for sharing your SkyBlock profile 🍣";
  }

  const name = embedData.username || "Player";
  const profileName = embedData.profile_cute_name ? ` (${embedData.profile_cute_name})` : "";
  const parts: string[] = [];

  if (embedData.skyblock_level != null) {
    parts.push(`Level ${formatNumber(embedData.skyblock_level)}`);
  }

  if (embedData.networth?.normal != null) {
    parts.push(`Networth: ${formatNumber(embedData.networth.normal)}`);
  }

  if (embedData.skills?.skillAverage != null) {
    parts.push(`Skill Avg: ${embedData.skills.skillAverage}`);
  }

  if (embedData.dungeons?.classAverage != null) {
    parts.push(`Class Avg: ${embedData.dungeons.classAverage}`);
  }

  if (embedData.slayers?.xp != null && embedData.slayers.xp > 0) {
    parts.push(`Slayer XP: ${formatNumber(embedData.slayers.xp)}`);
  }

  if (parts.length > 0) {
    return `Check out ${name}'s SkyBlock profile${profileName} on SkyCrypt: ${parts.join(" • ")}.`;
  }

  if (embedData.joined) {
    return `${name} has been playing SkyBlock for ${formatDistanceToNowStrict(new Date(embedData.joined))} on SkyCrypt.`;
  }

  return `View ${name}'s Hypixel SkyBlock stats, skills, networth, dungeons, and gear on SkyCrypt.`;
}

function getGenericTitle(embedData: ModelsEmbedData): string {
  if (!embedData || !embedData.username) {
    return "SkyBlock Stats | SkyCrypt";
  }

  const name = embedData.username;
  const profile = embedData.profile_cute_name;
  const gameMode = embedData.game_mode && embedData.game_mode !== "normal" ? ` [${embedData.game_mode}]` : "";

  if (profile) {
    return `${name} (${profile}${gameMode}) | SkyBlock Stats`;
  }

  return `${name} | SkyBlock Stats`;
}

export { getGenericDescription, getGenericTitle, getLongDescription, getMetaTitle, getShortDescription };
