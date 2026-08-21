import { describe, it } from "vitest";
import { hexToOklch, oklchToHex, parseOklch } from "./color-utils";

describe.concurrent("Color Utils (culori-based)", () => {
  describe.concurrent("hexToOklch", () => {
    it("should convert pure red", ({ expect }) => {
      const result = hexToOklch("#ff0000");
      expect(result).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
      const parsed = parseOklch(result);
      expect(parsed).not.toBeNull();
      expect(parsed!.L).toBeCloseTo(0.6279, 2);
      expect(parsed!.C).toBeGreaterThan(0.2);
      expect(parsed!.H).toBeCloseTo(29.23, 0);
    });

    it("should convert pure green", ({ expect }) => {
      const result = hexToOklch("#00ff00");
      const parsed = parseOklch(result);
      expect(parsed).not.toBeNull();
      expect(parsed!.L).toBeCloseTo(0.8664, 2);
      expect(parsed!.C).toBeGreaterThan(0.2);
    });

    it("should convert pure blue", ({ expect }) => {
      const result = hexToOklch("#0000ff");
      const parsed = parseOklch(result);
      expect(parsed).not.toBeNull();
      expect(parsed!.L).toBeCloseTo(0.452, 2);
      expect(parsed!.C).toBeGreaterThan(0.3);
    });

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

    it("should handle mid-gray", ({ expect }) => {
      const result = hexToOklch("#808080");
      const parsed = parseOklch(result);
      expect(parsed).not.toBeNull();
      expect(parsed!.L).toBeCloseTo(0.6, 1);
      expect(parsed!.C).toBeLessThan(0.001);
    });
  });

  describe.concurrent("oklchToHex", () => {
    it("should convert oklch red back to hex", ({ expect }) => {
      const result = oklchToHex("oklch(0.6279 0.2577 29.23)");
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
      expect(result).toBe("#ff0000");
    });

    it("should convert achromatic oklch to gray hex", ({ expect }) => {
      const result = oklchToHex("oklch(0.5 0 0)");
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it("should convert pure black oklch", ({ expect }) => {
      const result = oklchToHex("oklch(0 0 0)");
      expect(result).toBe("#000000");
    });

    it("should convert pure white oklch", ({ expect }) => {
      const result = oklchToHex("oklch(1 0 0)");
      expect(result).toBe("#ffffff");
    });

    it("should return #000000 for invalid input", ({ expect }) => {
      expect(oklchToHex("not-a-color")).toBe("#000000");
      expect(oklchToHex("")).toBe("#000000");
      expect(oklchToHex("rgb(255, 0, 0)")).not.toBe("#000000");
    });

    it("should handle oklch with alpha (ignores alpha for hex)", ({ expect }) => {
      const result = oklchToHex("oklch(0.5 0.2 180 / 0.5)");
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it("should handle percentage L format", ({ expect }) => {
      const absolute = oklchToHex("oklch(0.5 0.1 180)");
      const percentage = oklchToHex("oklch(50% 0.1 180)");
      expect(absolute).toBe(percentage);
    });

    it("should gamut-map out-of-sRGB colors", ({ expect }) => {
      const result = oklchToHex("oklch(0.7 0.4 150)");
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
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

    it("should parse achromatic values", ({ expect }) => {
      const result = parseOklch("oklch(1 0 0)");
      expect(result).not.toBeNull();
      expect(result!.L).toBe(1);
      expect(result!.C).toBe(0);
      expect(result!.H).toBe(0);
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

  describe.concurrent("theme-specific values", () => {
    it("should handle mctooltipBg alpha format", ({ expect }) => {
      const oklch = "oklch(0.12142 0.05582 328.352 / 0.93)";
      const hex = oklchToHex(oklch);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);

      const parsed = parseOklch(oklch);
      expect(parsed).not.toBeNull();
      expect(parsed!.alpha).toBeCloseTo(0.93, 2);
    });

    it("should handle percentage L format from CSS spec", ({ expect }) => {
      const result = oklchToHex("oklch(62.79% 0.2577 29.23)");
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
      const resultAbsolute = oklchToHex("oklch(0.6279 0.2577 29.23)");
      expect(result).toBe(resultAbsolute);
    });
  });
});
