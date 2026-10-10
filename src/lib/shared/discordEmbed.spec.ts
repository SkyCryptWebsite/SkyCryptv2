import { env } from "$env/dynamic/public";
import { expect, it } from "vitest";
import { createDiscordEmbed, serializeDiscordEmbed } from "./discordEmbed";

const { PUBLIC_DISCORD_INVITE } = env;

it.each([
  { rank: { plusColor: "#FF5555", rankColor: "#55FFFF" }, expected: 0xff5555 },
  { rank: { rankColor: "#55ffff" }, expected: 0x55ffff },
  { rank: { plusColor: "#000000", rankColor: "#55FFFF" }, expected: 0 },
  { rank: { plusColor: "invalid", rankColor: "#55FFFF" }, expected: 0x55ffff },
  { rank: { rankColor: "#12345678" }, expected: 0x282828 },
  { rank: undefined, expected: 0x282828 }
])("uses the preferred valid rank color: $rank", ({ rank, expected }) => {
  expect(createDiscordEmbed({ username: "tiltedhoney", rank }).component.accent_color).toBe(expected);
});

it("keeps embedded JSON inside its script element", () => {
  const embed = createDiscordEmbed({ username: "</script><script>alert(1)</script>&" });
  const json = serializeDiscordEmbed(embed);
  expect(json).not.toContain("<");
  expect(JSON.parse(json)).toEqual(embed);
});

it("uses the profile data and puts a separator directly above valid link buttons", () => {
  const embed = createDiscordEmbed({
    username: "tiltedhoney",
    profile_cute_name: "Kiwi",
    uuid: "debb9e1f6dcb4f5b83c291fd5388bb56",
    rank: { rankText: "MVP", plusText: "+" },
    skyblock_level: 620.16
  });
  const [section, separator, row, footer] = embed.component.components;
  expect(section).toMatchObject({
    type: 9,
    components: [
      {
        content: expect.stringContaining(
          "### [ [MVP+] tiltedhoney (Kiwi)](https://sky.shiiyu.moe/stats/tiltedhoney/Kiwi)"
        )
      }
    ],
    accessory: { type: 11, media: { url: "https://nmsr.nickac.dev/bust/debb9e1f6dcb4f5b83c291fd5388bb56?y=-20" } }
  });
  expect(JSON.stringify(section)).toContain("<:level:1558225225768767530> Level: 620.16");
  expect(separator).toEqual({ type: 14, divider: true, spacing: 1 });
  expect(row).toEqual({
    type: 1,
    components: [
      {
        type: 2,
        style: 5,
        label: "SkyCrypt",
        url: "https://sky.shiiyu.moe/stats/tiltedhoney/Kiwi?utm_source=SkyCrypt&utm_campaign=DiscordEmbed",
        emoji: { id: "1558259246070505512", name: "skycrypt" }
      },
      {
        type: 2,
        style: 5,
        label: "SkyCrypt Discord",
        url: PUBLIC_DISCORD_INVITE,
        emoji: { id: "1558259241679196280", name: "discord" }
      },
      {
        type: 2,
        style: 5,
        label: "Plancke",
        url: "https://plancke.io/hypixel/player/stats/tiltedhoney?utm_source=SkyCrypt&utm_campaign=DiscordEmbed",
        emoji: { id: "1558259244275597414", name: "plancke" }
      },
      {
        type: 2,
        style: 5,
        label: "Elite",
        url: "https://eliteskyblock.com/@tiltedhoney/Kiwi?utm_source=SkyCrypt&utm_campaign=DiscordEmbed",
        emoji: { id: "1558259242828435507", name: "elite" }
      }
    ]
  });
  expect(footer).toEqual({ type: 10, content: `-# SkyCrypt • v${__NPM_PACKAGE_VERSION__}` });
});
