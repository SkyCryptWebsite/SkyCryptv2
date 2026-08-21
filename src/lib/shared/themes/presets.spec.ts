import { describe, it } from "vitest";
import { getPaletteColors, MC_PALETTES, paletteNames } from "./presets";

describe.concurrent("Minecraft Palette Tests", () => {
  describe.concurrent("MC_PALETTES Structure", () => {
    it("should have exactly 16 color codes in nice-dark palette", ({ expect }) => {
      const palette = MC_PALETTES["nice-dark"];
      const keys = Object.keys(palette);

      expect(keys).toHaveLength(16);

      const expectedKeys = [
        "§0",
        "§1",
        "§2",
        "§3",
        "§4",
        "§5",
        "§6",
        "§7",
        "§8",
        "§9",
        "§a",
        "§b",
        "§c",
        "§d",
        "§e",
        "§f"
      ];
      expectedKeys.forEach((key) => {
        expect(keys).toContain(key);
      });
    });

    it("should have exactly 16 color codes in nice-light palette", ({ expect }) => {
      const palette = MC_PALETTES["nice-light"];
      const keys = Object.keys(palette);

      expect(keys).toHaveLength(16);

      const expectedKeys = [
        "§0",
        "§1",
        "§2",
        "§3",
        "§4",
        "§5",
        "§6",
        "§7",
        "§8",
        "§9",
        "§a",
        "§b",
        "§c",
        "§d",
        "§e",
        "§f"
      ];
      expectedKeys.forEach((key) => {
        expect(keys).toContain(key);
      });
    });

    it("should have exactly 16 color codes in true-colors palette", ({ expect }) => {
      const palette = MC_PALETTES["true-colors"];
      const keys = Object.keys(palette);

      expect(keys).toHaveLength(16);

      const expectedKeys = [
        "§0",
        "§1",
        "§2",
        "§3",
        "§4",
        "§5",
        "§6",
        "§7",
        "§8",
        "§9",
        "§a",
        "§b",
        "§c",
        "§d",
        "§e",
        "§f"
      ];
      expectedKeys.forEach((key) => {
        expect(keys).toContain(key);
      });
    });

    it("should have exactly 16 color codes in april-fools-2024 palette", ({ expect }) => {
      const palette = MC_PALETTES["april-fools-2024"];
      const keys = Object.keys(palette);

      expect(keys).toHaveLength(16);

      const expectedKeys = [
        "§0",
        "§1",
        "§2",
        "§3",
        "§4",
        "§5",
        "§6",
        "§7",
        "§8",
        "§9",
        "§a",
        "§b",
        "§c",
        "§d",
        "§e",
        "§f"
      ];
      expectedKeys.forEach((key) => {
        expect(keys).toContain(key);
      });
    });

    it("should have all palette values as valid OKLCH strings", ({ expect }) => {
      const oklchRegex = /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/;

      Object.entries(MC_PALETTES).forEach(([_paletteName, palette]) => {
        Object.entries(palette).forEach(([_code, color]) => {
          expect(color).toMatch(oklchRegex);
        });
      });
    });

    it("should have palette names matching schema enum", ({ expect }) => {
      const expectedPaletteNames = ["nice-dark", "nice-light", "true-colors", "april-fools-2024"];

      expect(paletteNames).toEqual(expectedPaletteNames);

      paletteNames.forEach((name) => {
        expect(MC_PALETTES).toHaveProperty(name);
      });
    });
  });

  describe.concurrent("getPaletteColors", () => {
    it("should return palette colors without overrides", ({ expect }) => {
      const colors = getPaletteColors("nice-dark");

      expect(colors).toHaveProperty("§0");
      expect(colors).toHaveProperty("§f");
      expect(Object.keys(colors)).toHaveLength(16);
      expect(colors["§a"]).toBe(MC_PALETTES["nice-dark"]["§a"]);
    });

    it("should merge overrides correctly", ({ expect }) => {
      const customColor = "oklch(0.5 0.1 100)";
      const colors = getPaletteColors("nice-dark", { "§a": customColor });

      expect(colors["§a"]).toBe(customColor);
      expect(colors["§0"]).toBe(MC_PALETTES["nice-dark"]["§0"]);
      expect(Object.keys(colors)).toHaveLength(16);
    });

    it("should merge multiple overrides correctly", ({ expect }) => {
      const customColorA = "oklch(0.5 0.1 100)";
      const customColorF = "oklch(0.9 0.2 200)";
      const colors = getPaletteColors("nice-dark", {
        "§a": customColorA,
        "§f": customColorF
      });

      expect(colors["§a"]).toBe(customColorA);
      expect(colors["§f"]).toBe(customColorF);
      expect(colors["§0"]).toBe(MC_PALETTES["nice-dark"]["§0"]);
      expect(colors["§b"]).toBe(MC_PALETTES["nice-dark"]["§b"]);
    });

    it("should work with all palette types", ({ expect }) => {
      const palettes = ["nice-dark", "nice-light", "true-colors", "april-fools-2024"] as const;

      palettes.forEach((paletteName) => {
        const colors = getPaletteColors(paletteName);
        expect(Object.keys(colors)).toHaveLength(16);
        expect(colors).toHaveProperty("§0");
        expect(colors).toHaveProperty("§f");
      });
    });

    it("should throw error for unknown palette", ({ expect }) => {
      expect(() => getPaletteColors("unknown-palette")).toThrow("Unknown palette: unknown-palette");
    });

    it("should preserve base palette when overrides are empty", ({ expect }) => {
      const colors = getPaletteColors("nice-dark", {});

      expect(colors).toEqual(MC_PALETTES["nice-dark"]);
    });

    it("should handle overrides with all 16 colors", ({ expect }) => {
      const overrides: Record<string, string> = {
        "§0": "oklch(0.0 0 0)",
        "§1": "oklch(0.1 0 0)",
        "§2": "oklch(0.2 0 0)",
        "§3": "oklch(0.3 0 0)",
        "§4": "oklch(0.4 0 0)",
        "§5": "oklch(0.5 0 0)",
        "§6": "oklch(0.6 0 0)",
        "§7": "oklch(0.7 0 0)",
        "§8": "oklch(0.8 0 0)",
        "§9": "oklch(0.9 0 0)",
        "§a": "oklch(1.0 0 0)",
        "§b": "oklch(0.95 0 0)",
        "§c": "oklch(0.85 0 0)",
        "§d": "oklch(0.75 0 0)",
        "§e": "oklch(0.65 0 0)",
        "§f": "oklch(0.55 0 0)"
      };

      const colors = getPaletteColors("nice-dark", overrides);

      Object.entries(overrides).forEach(([code, color]) => {
        expect(colors[code]).toBe(color);
      });
    });
  });

  describe.concurrent("Palette Color Validation", () => {
    it("should have distinct colors for each code within a palette", ({ expect }) => {
      Object.entries(MC_PALETTES).forEach(([_paletteName, palette]) => {
        const colorValues = Object.values(palette);
        const uniqueColors = new Set(colorValues);

        expect(uniqueColors.size).toBeGreaterThan(1);
      });
    });

    it("should have §0 as darkest color in nice-dark palette", ({ expect }) => {
      const black = MC_PALETTES["nice-dark"]["§0"];
      expect(black).toBe("oklch(0 0 0)");
    });

    it("should have §f as lightest color in nice-light palette", ({ expect }) => {
      const white = MC_PALETTES["nice-light"]["§f"];
      expect(white).toBe("oklch(1 0 0)");
    });

    it("should have consistent OKLCH format across all palettes", ({ expect }) => {
      const oklchRegex = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/;

      Object.entries(MC_PALETTES).forEach(([_paletteName, palette]) => {
        Object.entries(palette).forEach(([_code, color]) => {
          const match = color.match(oklchRegex);
          expect(match).not.toBeNull();

          if (match) {
            const [, l, c, h] = match;
            const lightness = parseFloat(l);
            const chroma = parseFloat(c);
            const hue = parseFloat(h);

            expect(lightness).toBeGreaterThanOrEqual(0);
            expect(lightness).toBeLessThanOrEqual(1);
            expect(chroma).toBeGreaterThanOrEqual(0);
            expect(hue).toBeGreaterThanOrEqual(0);
            expect(hue).toBeLessThanOrEqual(360);
          }
        });
      });
    });
  });
});
