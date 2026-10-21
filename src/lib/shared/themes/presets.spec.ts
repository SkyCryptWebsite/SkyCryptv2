import { describe, it } from "vitest";
import { getPaletteColors, MC_PALETTES } from "./presets";

describe.concurrent("Minecraft Palette Tests", () => {
  describe.concurrent("MC_PALETTES Structure", () => {
    it("should have all palette values as valid OKLCH strings", ({ expect }) => {
      const oklchRegex = /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/;

      Object.entries(MC_PALETTES).forEach(([_paletteName, palette]) => {
        Object.entries(palette).forEach(([_code, color]) => {
          expect(color).toMatch(oklchRegex);
        });
      });
    });
  });

  describe.concurrent("getPaletteColors", () => {
    it("should merge overrides correctly", ({ expect }) => {
      const customColor = "oklch(0.5 0.1 100)";
      const colors = getPaletteColors("nice-dark", { "§a": customColor });

      expect(colors["§a"]).toBe(customColor);
      expect(colors["§0"]).toBe(MC_PALETTES["nice-dark"]["§0"]);
      expect(Object.keys(colors)).toHaveLength(16);
    });

    it("should throw error for unknown palette", ({ expect }) => {
      expect(() => getPaletteColors("unknown-palette")).toThrow("Unknown palette: unknown-palette");
    });
  });
});
