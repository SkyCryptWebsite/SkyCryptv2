import { PUBLIC_DISCORD_INVITE } from "$app/env/public";
import type { APIBaseComponent, ComponentType } from "discord-api-types/v10";
import { describe, expect, it } from "vitest";
import type { ModelsEmbedData } from "#lib/shared/api/orval-generated";
import { createDiscordEmbed, serializeDiscordEmbed } from "./discordEmbed";

describe("discordEmbed", () => {
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
      accessory: {
        type: 11,
        media: { url: "https://nmsr.nickac.dev/bust/debb9e1f6dcb4f5b83c291fd5388bb56?y=-20" }
      }
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

  describe("Discord Component Embed requirements and limits", () => {
    const fullMockData: ModelsEmbedData = {
      username: "tiltedhoney",
      profile_cute_name: "Kiwi",
      game_mode: "ironman",
      uuid: "debb9e1f6dcb4f5b83c291fd5388bb56",
      rank: { rankText: "MVP", plusText: "++", rankColor: "#FFAA00", plusColor: "#FF5555" },
      skyblock_level: 420.69,
      networth: { normal: 15000000000 },
      purse: 500000000,
      bank: 1000000000,
      skills: {
        skillAverage: 55.5,
        skills: {
          combat: 60,
          farming: 60,
          fishing: 50,
          mining: 60,
          foraging: 50,
          enchanting: 60,
          alchemy: 50,
          carpentry: 50,
          runecrafting: 25,
          taming: 50,
          social: 20,
          hunting: 25
        }
      },
      dungeons: {
        classAverage: 50,
        dungeoneering: 50,
        classes: {
          healer: 50,
          mage: 50,
          berserk: 50,
          archer: 50,
          tank: 50
        }
      },
      slayers: {
        xp: 15000000,
        slayers: {
          zombie: 9,
          spider: 9,
          wolf: 9,
          enderman: 9,
          vampire: 5,
          blaze: 9
        }
      }
    };

    it("does not exceed the Discord 3000 byte limit for serialized JSON with complete profile data", () => {
      const embed = createDiscordEmbed(fullMockData);
      const json = serializeDiscordEmbed(embed);
      const byteLength = Buffer.byteLength(json, "utf-8");

      expect(byteLength).toBeLessThanOrEqual(3000);
    });

    it("does not exceed the Discord 3000 byte limit without uuid (fallback layout)", () => {
      const dataWithoutUuid = { ...fullMockData, uuid: undefined };
      const embed = createDiscordEmbed(dataWithoutUuid);
      const json = serializeDiscordEmbed(embed);
      const byteLength = Buffer.byteLength(json, "utf-8");

      expect(byteLength).toBeLessThanOrEqual(3000);
    });

    it("does not exceed the 40 component limit in total", () => {
      const embed = createDiscordEmbed(fullMockData);

      function countComponents(comp: unknown): number {
        if (!comp || typeof comp !== "object") return 0;
        let count = 1;
        if ("components" in comp && Array.isArray(comp.components)) {
          for (const child of comp.components) {
            count += countComponents(child);
          }
        }
        if ("accessory" in comp && comp.accessory) {
          count += countComponents(comp.accessory);
        }
        return count;
      }

      const totalComponents = countComponents(embed.component);
      expect(totalComponents).toBeLessThanOrEqual(40);
    });

    it("only uses allowed component types and valid button structures", () => {
      const embed = createDiscordEmbed(fullMockData);
      const allowedTypes = [1, 2, 9, 10, 11, 12, 14, 17];
      const allowedButtonKeys = new Set(["id", "type", "url", "style", "label", "emoji", "disabled"]);

      function validateComponent(comp: APIBaseComponent<ComponentType> & Record<string, unknown>) {
        expect(allowedTypes).toContain(comp.type);

        if (comp.type === 2) {
          // Button must be link style (5)
          expect(comp.style).toBe(5);
          expect(typeof comp.url).toBe("string");
          expect((comp.url as string).length).toBeLessThanOrEqual(2048);
          expect((comp.url as string).startsWith("http://") || (comp.url as string).startsWith("https://")).toBe(true);
          expect(comp.label != null || comp.emoji != null).toBe(true);

          for (const key of Object.keys(comp)) {
            expect(allowedButtonKeys.has(key)).toBe(true);
          }
        }

        if (comp.type === 11 && comp.media && typeof comp.media === "object") {
          const media = comp.media as { url?: string };
          expect(typeof media.url).toBe("string");
          expect((media.url as string).length).toBeLessThanOrEqual(2048);
          expect((media.url as string).startsWith("http://") || (media.url as string).startsWith("https://")).toBe(
            true
          );
        }

        if ("components" in comp && Array.isArray(comp.components)) {
          for (const child of comp.components) {
            validateComponent(child as APIBaseComponent<ComponentType> & Record<string, unknown>);
          }
        }

        if ("accessory" in comp && comp.accessory && typeof comp.accessory === "object") {
          validateComponent(comp.accessory as APIBaseComponent<ComponentType> & Record<string, unknown>);
        }
      }

      validateComponent(embed.component as APIBaseComponent<ComponentType> & Record<string, unknown>);
    });
  });
});
