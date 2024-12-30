<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import { formatNumber, removeFormatting } from "$lib/shared/helper";
  import type { Skill } from "$types/stats";
  import { formatDistanceToNowStrict } from "date-fns";
  import SvelteSeo from "svelte-seo";

  const { profile } = getProfileCtx();

  const skillEmojis = {
    alchemy: "⚗️",
    carpentry: "🪑",
    combat: "⚔️",
    enchanting: "🔮",
    farming: "🌾",
    fishing: "🎣",
    foraging: "🌳",
    mining: "⛏️",
    runecrafting: "✨",
    social: "💬",
    taming: "🦴",
    dungeons: "💀",
    archer: "🏹",
    berserk: "🗡️",
    healer: "🚑",
    mage: "🧙🏽",
    tank: "🛡️"
  } as Record<string, string>;

  const slayerEmojis = {
    zombie: "🧟",
    spider: "🕸️",
    wolf: "🐺",
    enderman: "🔮",
    blaze: "🔥",
    vampire: "🩸"
  } as Record<string, string>;

  function getDescription() {
    let output = "";

    // Skyblock Level
    if (profile.skyblock_level.xp !== 0 && profile.skyblock_level.level !== 0) {
      output += `🌟 Skyblock Level: ${(profile.skyblock_level.level + profile.skyblock_level.progress).toFixed(0)}\n`;
    }

    // Armor
    if (profile.items.armor?.set_name !== undefined) {
      output += `🛡️ ${removeFormatting(profile.items.armor.set_name)}\n`;
    }

    // Sword
    if (profile.items.weapons?.highest_priority_weapon !== undefined) {
      output += `🗡️ ${removeFormatting(profile.items.weapons.highest_priority_weapon.display_name)}\n`;
    }

    // Skills
    const skills = (profile.skills?.skills ?? {}) as Record<string, Skill>;
    if (skills !== undefined) {
      const skill = Object.keys(skills).sort((a, b) => skills[b].xp - skills[a].xp)[0];

      if (skills[skill].level !== undefined) {
        output += `${skillEmojis[skill]} ${skill.charAt(0).toUpperCase() + skill.slice(1)} ${skills[skill].level}\n`;
      }
    }

    // Pet
    if (profile.pets?.pets !== undefined) {
      const activePet = profile.pets.pets.find((a) => a.active);
      if (activePet !== undefined) {
        output += `🐾 ${(activePet.rarity ?? "common").charAt(0).toUpperCase() + (activePet.rarity ?? "common").slice(1)} ${activePet.display_name} (Lvl ${activePet.level})\n`;
      }
    }

    // Line break
    output += "\n";

    // Slayers
    if (profile.slayer?.totalSlayerExp > 0) {
      output += "🤺 Slayer: ";

      const slayerOrder = ["zombie", "spider", "wolf", "enderman", "vampire", "blaze"];
      for (const slayer of slayerOrder) {
        if (profile.slayer.data[slayer] === undefined) {
          continue;
        }

        const slayerInfo = profile.slayer.data[slayer];
        if (slayerInfo.level.level === 0) {
          continue;
        }

        output += `${slayerEmojis[slayer]} ${slayerInfo.level.level} `;
      }

      output += "\n";
    }

    // Dungeons
    if (profile.dungeons !== undefined) {
      const dungeonsLevel = profile.dungeons?.level?.level;
      if (dungeonsLevel > 0) {
        output += `${skillEmojis["dungeons"]} Catacombs: ${dungeonsLevel}\n`;
      }

      const classes = profile.dungeons?.classes?.classes;
      if (classes !== undefined) {
        for (const [dclass, data] of Object.entries(classes)) {
          output += `${skillEmojis[dclass]} ${data.level ?? 0} `;
        }
      }

      output += "\n";
    }

    output += "\n";

    if (profile.skills?.averageSkillLevel || profile.dungeons?.classes?.classAverage) {
      // Skill Average
      if (profile.skills.averageSkillLevel !== undefined) {
        output += `📚 Avg Skill Level: ${profile.skills.averageSkillLevel.toFixed(2)}\n`;
      }

      // Dungeons classs average
      if (profile.dungeons?.classes?.classAverage) {
        output += `⚔️ Avg Class Level: ${profile.dungeons?.classes?.classAverage.toFixed(2)}\n`;
      }

      output += "\n";
    }

    // Networth, Bank & purse
    if (profile.stats.networth.noInventory === false) {
      output += `💸 Networth: ${formatNumber(profile.stats.networth.networth)}\n`;
    }

    if (profile.stats.bank !== undefined) {
      output += `🏦 Bank: ${formatNumber(profile.stats.bank)}\n`;
    }

    if (profile.stats.purse !== undefined) {
      output += `💰 Purse: ${formatNumber(profile.stats.purse)}\n`;
    }

    return output;
  }

  function getMetaTitle() {
    let metaTitle = profile.displayName;

    switch (profile.game_mode) {
      case "ironman":
        metaTitle += ` (${profile.profile_cute_name} ♻️)`;
        break;

      case "bingo":
        metaTitle += ` (${profile.profile_cute_name} 🎲)`;
        break;

      case "island":
        metaTitle += ` (${profile.profile_cute_name} 🌴)`;
        break;

      default:
        metaTitle += ` (${profile.profile_cute_name})`;
        break;
    }

    return metaTitle;
  }

  function getMetaDescription() {
    let description = "";

    // Base
    if (profile.stats?.joined !== undefined) {
      description += `${profile.displayName} has been playing SkyBlock for ${formatDistanceToNowStrict(profile.stats.joined)}`;
    }

    const highestRaritySword = profile.items.weapons?.highest_priority_weapon?.display_name;

    // Armor set
    if (profile.items.armor?.set_name !== undefined) {
      if (highestRaritySword !== undefined) {
        description += `, is wearing ${profile.items.armor.set_name}`;
      } else {
        description += `and is wearing ${profile.items.armor.set_name}`;
      }
    }

    return description;
  }
</script>

<svelte:head>
  <link rel="icon" href={`https://crafatar.com/avatars/${profile.uuid}?size=32&overlay`} sizes="32x32" type="image/png" />
</svelte:head>

<SvelteSeo
  title="{profile.displayName} | SkyCrypt"
  description={getDescription()}
  canonical="https://sky.shiiyu.moe/stats/{profile.uuid}/{profile.profile_id}"
  openGraph={{
    title: getMetaTitle(),
    description: getMetaDescription(),
    type: "profile",
    profile: {
      username: profile.username
    },
    images: [
      {
        url: `https://crafatar.com/avatars/${profile.uuid}?size=512&overlay`,
        width: 512,
        height: 512,
        alt: profile.displayName
      }
    ],
    site_name: "SkyCrypt"
  }}
  twitter={{
    card: "summary",
    image: `https://crafatar.com/avatars/${profile.uuid}?size=512&overlay`,
    imageAlt: profile.displayName,
    title: getMetaTitle()
  }} />
