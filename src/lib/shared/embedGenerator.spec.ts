import { afterEach, describe, it, vi } from "vitest";
import type { ModelsEmbedData } from "#lib/shared/api/orval-generated";
import {
  getGenericDescription,
  getGenericTitle,
  getLongDescription,
  getMetaTitle,
  getShortDescription
} from "#lib/shared/embedGenerator";

describe.concurrent("embedGenerator", () => {
  describe.concurrent("getMetaTitle", () => {
    it("should return empty string when embedData is null", ({ expect }) => {
      expect.assertions(1);
      // @ts-expect-error Testing null case
      const result = getMetaTitle(null);
      expect(result).toBe("");
    });

    it("should return empty string when username is missing", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {};

      const result = getMetaTitle(embedData);
      expect(result).toBe("");
    });

    it("should return title without profile name when missing", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer"
      };

      const result = getMetaTitle(embedData);
      expect(result).toBe("TestPlayer (undefined )");
    });

    it("should return title with profile name and no icon for default game mode", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        profile_cute_name: "Banana"
      };

      const result = getMetaTitle(embedData);
      expect(result).toBe("TestPlayer (Banana )");
    });

    it("should return title with ironman icon for ironman game mode", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "IronPlayer",
        profile_cute_name: "Iron Profile",
        game_mode: "ironman"
      };

      const result = getMetaTitle(embedData);
      expect(result).toBe("IronPlayer (Iron Profile ♲)");
    });

    it("should return title with bingo icon for bingo game mode", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "BingoPlayer",
        profile_cute_name: "Bingo Profile",
        game_mode: "bingo"
      };

      const result = getMetaTitle(embedData);
      expect(result).toBe("BingoPlayer (Bingo Profile Ⓑ)");
    });

    it("should return title with island icon for island game mode", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "IslandPlayer",
        profile_cute_name: "Island Profile",
        game_mode: "island"
      };

      const result = getMetaTitle(embedData);
      expect(result).toBe("IslandPlayer (Island Profile ☀)");
    });

    it("should handle unknown game mode as default", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "UnknownPlayer",
        profile_cute_name: "Custom Profile",
        game_mode: "unknown_mode"
      };

      const result = getMetaTitle(embedData);
      expect(result).toBe("UnknownPlayer (Custom Profile )");
    });
  });

  describe.concurrent("getLongDescription", () => {
    it("should return empty string when embedData is null", ({ expect }) => {
      expect.assertions(1);
      // @ts-expect-error Testing null case
      const result = getLongDescription(null);
      expect(result).toBe("");
    });

    it("should return empty string when username is missing", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        skyblock_level: 250.5
      };

      const result = getLongDescription(embedData);
      expect(result).toBe("");
    });

    it("should format skyblock level with emoji", ({ expect }) => {
      expect.assertions(2);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        skyblock_level: 250.5
      };

      const result = getLongDescription(embedData);
      expect(result).toContain("<:level:1558225225768767530> Level:");
      expect(result).toContain("250.5");
    });

    it("should format networth with emoji when normal value exists", ({ expect }) => {
      expect.assertions(2);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        networth: {
          normal: 1500000000
        }
      };

      const result = getLongDescription(embedData);
      expect(result).toContain("<:networth:1558225229418074112> Networth:");
      expect(result).toContain("1.50B");
    });

    it("should not include networth when normal value is null", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        networth: {
          normal: undefined
        }
      };

      const result = getLongDescription(embedData);
      expect(result).not.toContain("<:networth:1558225229418074112> Networth:");
    });

    it("should format purse with emoji", ({ expect }) => {
      expect.assertions(2);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        purse: 50000000
      };

      const result = getLongDescription(embedData);
      expect(result).toContain("<:purse:1558225230613450814> Purse:");
      expect(result).toContain("50M");
    });

    it("should format bank with emoji", ({ expect }) => {
      expect.assertions(2);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        bank: 100000000
      };

      const result = getLongDescription(embedData);
      expect(result).toContain("<:bank:1558225205909000202> Bank:");
      expect(result).toContain("100M");
    });

    it("should format skills with emojis and skill average", ({ expect }) => {
      expect.assertions(5);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        skills: {
          skillAverage: 45.5,
          skills: {
            farming: 50,
            mining: 60,
            combat: 50,
            foraging: 50
          }
        }
      };

      const result = getLongDescription(embedData);
      expect(result).toContain("<:skills:1558225234547580948> **Skill Average: 45.5**");
      expect(result).toContain("<:farming:1558225218567147651> 50");
      expect(result).toContain("<:mining:1558225228235018271> 60");
      expect(result).toContain("<:combat:1558225211923636315> 50");
      expect(result).toContain("<:foraging:1558225221247303880> 50");
    });

    it("should order skills correctly across groups", ({ expect }) => {
      expect.assertions(2);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        skills: {
          skillAverage: 50,
          skills: {
            enchanting: 60,
            combat: 50,
            farming: 40,
            hunting: 30,
            alchemy: 20
          }
        }
      };

      const result = getLongDescription(embedData);
      // Group 1: combat, farming, enchanting
      expect(result).toContain(
        "<:combat:1558225211923636315> 50 ︲ <:farming:1558225218567147651> 40 ︲ <:enchanting:1558225216164069436> 60"
      );
      // Group 2: alchemy, hunting
      expect(result).toContain("<:alchemy:1558225203379703858> 20 ︲ <:hunting:1558225223621283921> 30");
    });

    it("should not include skills when skills object is empty", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        skills: {
          skillAverage: 0,
          skills: {}
        }
      };

      const result = getLongDescription(embedData);
      expect(result).not.toContain("<:skills:1558225234547580948> **Skill Average:");
    });

    it("should format dungeons with class average and dungeoneering level", ({ expect }) => {
      expect.assertions(3);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        dungeons: {
          classAverage: 40.5,
          dungeoneering: 50,
          classes: {
            healer: 45,
            mage: 50,
            berserk: 40,
            archer: 35,
            tank: 30
          }
        }
      };

      const result = getLongDescription(embedData);
      expect(result).toContain("<:dungeons:1558225214444150794> **Class Average: 40.5**");
      expect(result).toContain("<:dungeoneering:1558225213223866399> 50");
      expect(result).toContain("<:mage:1558225227039637624> 50");
    });

    it("should default dungeoneering to 0 when undefined", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        dungeons: {
          classAverage: 20
        }
      };

      const result = getLongDescription(embedData);
      expect(result).toContain("<:dungeoneering:1558225213223866399> 0");
    });

    it("should not include dungeons when classAverage is undefined", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        dungeons: {
          dungeoneering: 30,
          classes: {
            mage: 40
          }
        }
      };

      const result = getLongDescription(embedData);
      expect(result).not.toContain("<:dungeons:1558225214444150794>");
    });

    it("should order dungeon classes correctly according to healer, mage, berserk, archer, tank", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        dungeons: {
          classAverage: 40,
          dungeoneering: 50,
          classes: {
            tank: 30,
            mage: 50,
            archer: 35,
            healer: 45,
            berserk: 40
          }
        }
      };

      const result = getLongDescription(embedData);
      expect(result).toContain(
        "<:dungeoneering:1558225213223866399> 50 ︲ <:healer:1558225222702866442> 45 ︲ <:mage:1558225227039637624> 50 ︲ <:berserk:1558225207322476544> 40 ︲ <:archer:1558225204704976966> 35 ︲ <:tank:1558225242030346390> 30"
      );
    });

    it("should format slayers with total xp and individual slayer levels", ({ expect }) => {
      expect.assertions(4);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        slayers: {
          xp: 5000000,
          slayers: {
            zombie: 9,
            spider: 8,
            wolf: 8,
            enderman: 5
          }
        }
      };

      const result = getLongDescription(embedData);
      expect(result).toContain("<:slayyyter:1558225235713593354> **Slayer XP: 5M**");
      expect(result).toContain("<:zombie:1558225246945939527> 9");
      expect(result).toContain("<:spider:1558225239299727380> 8");
      expect(result).toContain("<:wolf:1558225245532463225> 8");
    });

    it("should order slayers correctly", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        slayers: {
          xp: 1000000,
          slayers: {
            blaze: 3,
            zombie: 9,
            wolf: 7,
            spider: 8
          }
        }
      };

      const result = getLongDescription(embedData);
      expect(result).toContain(
        "<:zombie:1558225246945939527> 9 ︲ <:spider:1558225239299727380> 8 ︲ <:wolf:1558225245532463225> 7 ︲ <:blaze:1558225209226559529> 3"
      );
    });

    it("should not include slayers section when xp is 0", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        slayers: {
          xp: 0,
          slayers: {
            zombie: 5
          }
        }
      };

      const result = getLongDescription(embedData);
      expect(result).not.toContain("<:slayyyter:1558225235713593354> **Slayer XP:");
    });

    it("should not include slayers section when xp is undefined", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        slayers: {
          slayers: {
            zombie: 5
          }
        }
      };

      const result = getLongDescription(embedData);
      expect(result).not.toContain("<:slayyyter:1558225235713593354> **Slayer XP:");
    });

    it("should handle embedData with all fields missing gracefully", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {};

      const result = getLongDescription(embedData);
      expect(result).toBe("");
    });

    it("should handle embedData with only username gracefully", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer"
      };

      const result = getLongDescription(embedData);
      expect(result).toBe("\n");
    });
  });

  describe("getShortDescription", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return empty string when joined is undefined", ({ expect }) => {
      expect.assertions(1);
      const embedData: ModelsEmbedData = {
        username: "TestPlayer"
      };

      const result = getShortDescription(embedData);
      expect(result).toBe("");
    });

    it("should format time distance correctly with fake timers", ({ expect }) => {
      expect.assertions(1);
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T00:00:00.000Z"));

      const embedData: ModelsEmbedData = {
        username: "TestPlayer",
        joined: new Date("2023-01-01T00:00:00.000Z").getTime()
      };

      const result = getShortDescription(embedData);
      expect(result).toBe("TestPlayer has been playing SkyBlock for 2 years");
    });

    it("should handle recent join date with fake timers - months", ({ expect }) => {
      expect.assertions(1);
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T00:00:00.000Z"));

      const embedData: ModelsEmbedData = {
        username: "NewPlayer",
        joined: new Date("2025-01-15T00:00:00.000Z").getTime()
      };

      const result = getShortDescription(embedData);
      expect(result).toBe("NewPlayer has been playing SkyBlock for 5 months");
    });

    it("should handle very recent join date with fake timers - days", ({ expect }) => {
      expect.assertions(1);
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T00:00:00.000Z"));

      const embedData: ModelsEmbedData = {
        username: "VeryNewPlayer",
        joined: new Date("2025-06-01T00:00:00.000Z").getTime()
      };

      const result = getShortDescription(embedData);
      expect(result).toBe("VeryNewPlayer has been playing SkyBlock for 14 days");
    });

    it("should handle join date less than a day with fake timers", ({ expect }) => {
      expect.assertions(1);
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));

      const embedData: ModelsEmbedData = {
        username: "BrandNewPlayer",
        joined: new Date("2025-06-15T06:00:00.000Z").getTime()
      };

      const result = getShortDescription(embedData);
      expect(result).toBe("BrandNewPlayer has been playing SkyBlock for 6 hours");
    });

    it("should handle exact year boundary with fake timers", ({ expect }) => {
      expect.assertions(1);
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

      const embedData: ModelsEmbedData = {
        username: "AnniversaryPlayer",
        joined: new Date("2024-01-01T00:00:00.000Z").getTime()
      };

      const result = getShortDescription(embedData);
      expect(result).toBe("AnniversaryPlayer has been playing SkyBlock for 1 year");
    });

    it("should handle leap year date with fake timers", ({ expect }) => {
      expect.assertions(1);
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-02-28T00:00:00.000Z"));

      const embedData: ModelsEmbedData = {
        username: "LeapPlayer",
        joined: new Date("2024-02-29T00:00:00.000Z").getTime()
      };

      const result = getShortDescription(embedData);
      expect(result).toBe("LeapPlayer has been playing SkyBlock for 1 year");
    });
  });

  describe("getGenericTitle", () => {
    it("returns default title when embedData is empty or missing username", ({ expect }) => {
      // @ts-expect-error null case
      expect(getGenericTitle(null)).toBe("SkyBlock Stats | SkyCrypt");
      expect(getGenericTitle({})).toBe("SkyBlock Stats | SkyCrypt");
    });

    it("returns formatted title with player and profile name", ({ expect }) => {
      const embedData: ModelsEmbedData = {
        username: "tiltedhoney",
        profile_cute_name: "Kiwi"
      };
      expect(getGenericTitle(embedData)).toBe("tiltedhoney (Kiwi) | SkyBlock Stats");
    });

    it("includes gamemode when not normal", ({ expect }) => {
      const embedData: ModelsEmbedData = {
        username: "ironman_steve",
        profile_cute_name: "Apple",
        game_mode: "ironman"
      };
      expect(getGenericTitle(embedData)).toBe("ironman_steve (Apple [ironman]) | SkyBlock Stats");
    });

    it("returns title without profile when profile is missing", ({ expect }) => {
      const embedData: ModelsEmbedData = {
        username: "tiltedhoney"
      };
      expect(getGenericTitle(embedData)).toBe("tiltedhoney | SkyBlock Stats");
    });
  });

  describe("getGenericDescription", () => {
    it("returns default description when embedData is empty", ({ expect }) => {
      // @ts-expect-error null case
      expect(getGenericDescription(null)).toBe("A beautiful site for sharing your SkyBlock profile 🍣");
      expect(getGenericDescription({})).toBe("A beautiful site for sharing your SkyBlock profile 🍣");
    });

    it("creates a clean, human-readable SEO summary with stats", ({ expect }) => {
      const embedData: ModelsEmbedData = {
        username: "tiltedhoney",
        profile_cute_name: "Kiwi",
        skyblock_level: 420.5,
        networth: { normal: 15200000000 },
        skills: { skillAverage: 55.4 },
        dungeons: { classAverage: 50 },
        slayers: { xp: 12000000 }
      };

      const desc = getGenericDescription(embedData);
      expect(desc).toBe(
        "Check out tiltedhoney's SkyBlock profile (Kiwi) on SkyCrypt: Level 420.50 • Networth: 15.20B • Skill Avg: 55.4 • Class Avg: 50 • Slayer XP: 12M."
      );
      // Ensure no Discord custom emoji IDs or Discord markdown tags are leaked
      expect(desc).not.toContain("<:");
      expect(desc).not.toContain("-#");
      expect(desc).not.toContain("**");
    });

    it("falls back to join date if no primary stats are present", ({ expect }) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T00:00:00.000Z"));

      const embedData: ModelsEmbedData = {
        username: "tiltedhoney",
        joined: new Date("2023-01-01T00:00:00.000Z").getTime()
      };

      expect(getGenericDescription(embedData)).toBe("tiltedhoney has been playing SkyBlock for 2 years on SkyCrypt.");
      vi.useRealTimers();
    });

    it("falls back to generic profile overview if joined and stats are absent", ({ expect }) => {
      const embedData: ModelsEmbedData = {
        username: "tiltedhoney"
      };

      expect(getGenericDescription(embedData)).toBe(
        "View tiltedhoney's Hypixel SkyBlock stats, skills, networth, dungeons, and gear on SkyCrypt."
      );
    });
  });
});
