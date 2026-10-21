import { describe, it } from "vitest";
import { hexToOklch, oklchToHex, parseOklch } from "./color-utils";

describe.concurrent("Color Utils (culori-based)", () => {
  describe.concurrent("hexToOklch", () => {
    it("should convert pure white to achromatic", ({ expect }) => {
      const result = hexToOklch("#ffffff");
      expect(result).toBe("oklch(1 0 0)");
    });

    it("should convert pure black to achromatic", ({ expect }) => {
      const result = hexToOklch("#000000");
      expect(result).toBe("oklch(0 0 0)");
    });

    it("should handle 3-character hex shorthand", ({ expect }) => {
      const short = hexToOklch("#f00");
      const full = hexToOklch("#ff0000");
      expect(short).toBe(full);
    });

    it("should output absolute L format (0-1), not percentage", ({ expect }) => {
      const result = hexToOklch("#ff0000");
      expect(result).not.toContain("%");
      const parsed = parseOklch(result);
      expect(parsed!.L).toBeGreaterThan(0);
      expect(parsed!.L).toBeLessThanOrEqual(1);
    });
  });

  describe.concurrent("oklchToHex", () => {
    it("should return #000000 for invalid input", ({ expect }) => {
      expect(oklchToHex("not-a-color")).toBe("#000000");
      expect(oklchToHex("")).toBe("#000000");
      expect(oklchToHex("rgb(255, 0, 0)")).not.toBe("#000000");
    });

    it("should handle percentage L format", ({ expect }) => {
      const absolute = oklchToHex("oklch(0.5 0.1 180)");
      const percentage = oklchToHex("oklch(50% 0.1 180)");
      expect(absolute).toBe(percentage);
    });
  });

  describe.concurrent("parseOklch", () => {
    it("should parse standard oklch string", ({ expect }) => {
      const result = parseOklch("oklch(0.6279 0.2577 29.23)");
      expect(result).not.toBeNull();
      expect(result!.L).toBeCloseTo(0.6279, 3);
      expect(result!.C).toBeCloseTo(0.2577, 3);
      expect(result!.H).toBeCloseTo(29.23, 1);
      expect(result!.alpha).toBeUndefined();
    });

    it("should parse oklch with alpha", ({ expect }) => {
      const result = parseOklch("oklch(0.5 0.1 180 / 0.93)");
      expect(result).not.toBeNull();
      expect(result!.L).toBeCloseTo(0.5, 3);
      expect(result!.alpha).toBeCloseTo(0.93, 2);
    });

    it("should parse percentage L format", ({ expect }) => {
      const result = parseOklch("oklch(62.79% 0.2577 29.23)");
      expect(result).not.toBeNull();
      expect(result!.L).toBeCloseTo(0.6279, 3);
    });

    it("should return null for invalid input", ({ expect }) => {
      expect(parseOklch("not-a-color")).toBeNull();
      expect(parseOklch("rgb(255, 0, 0)")).toBeNull();
      expect(parseOklch("hsl(0, 100%, 50%)")).toBeNull();
    });

    it("should return null for empty string", ({ expect }) => {
      expect(parseOklch("")).toBeNull();
    });
  });

  describe.concurrent("roundtrip conversions", () => {
    const testColors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffffff",
      "#000000",
      "#808080",
      "#ff8c00",
      "#4a90d9",
      "#2ecc71",
      "#9b59b6"
    ];

    for (const hex of testColors) {
      it(`should roundtrip ${hex} → oklch → hex within ±1 per channel`, ({ expect }) => {
        const oklch = hexToOklch(hex);
        const backToHex = oklchToHex(oklch);

        const originalR = parseInt(hex.slice(1, 3), 16);
        const originalG = parseInt(hex.slice(3, 5), 16);
        const originalB = parseInt(hex.slice(5, 7), 16);

        const resultR = parseInt(backToHex.slice(1, 3), 16);
        const resultG = parseInt(backToHex.slice(3, 5), 16);
        const resultB = parseInt(backToHex.slice(5, 7), 16);

        expect(Math.abs(originalR - resultR)).toBeLessThanOrEqual(1);
        expect(Math.abs(originalG - resultG)).toBeLessThanOrEqual(1);
        expect(Math.abs(originalB - resultB)).toBeLessThanOrEqual(1);
      });
    }
  });
});
