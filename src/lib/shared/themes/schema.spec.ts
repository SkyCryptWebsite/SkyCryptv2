import { describe, it } from "vitest";
import { DEFAULT_THEME } from "./defaults";
import { partialThemeV4Schema, themeV4Schema } from "./schema";

describe.concurrent("Theme V4 Schema Validation", () => {
  describe.concurrent("themeV4Schema", () => {
    it("parses a valid full theme", ({ expect }) => {
      const result = themeV4Schema.safeParse(DEFAULT_THEME);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.schema).toBe(4);
        expect(result.data.metadata.id).toBe("default");
      }
    });

    it("rejects an invalid color", ({ expect }) => {
      const result = themeV4Schema.safeParse({
        ...DEFAULT_THEME,
        cssVars: {
          ...DEFAULT_THEME.cssVars,
          primary: "not-a-color"
        }
      });

      expect(result.success).toBe(false);
    });

    it("rejects an HTTP page background URL", ({ expect }) => {
      const result = themeV4Schema.safeParse({
        ...DEFAULT_THEME,
        extras: {
          ...DEFAULT_THEME.extras,
          pageBackground: {
            url: "http://example.com/bg.jpg"
          }
        }
      });

      expect(result.success).toBe(false);
    });

    it("rejects an invalid mode", ({ expect }) => {
      const result = themeV4Schema.safeParse({
        ...DEFAULT_THEME,
        mode: "sepia"
      });

      expect(result.success).toBe(false);
    });

    it("rejects invalid Minecraft override keys", ({ expect }) => {
      const result = themeV4Schema.safeParse({
        ...DEFAULT_THEME,
        extras: {
          ...DEFAULT_THEME.extras,
          minecraft: {
            palette: "nice-light",
            overrides: {
              z: "oklch(0.5 0.1 100)"
            }
          }
        }
      });

      expect(result.success).toBe(false);
    });

    it("accepts generated lowercase theme ids", ({ expect }) => {
      for (const id of ["custom-1780000000000", "custom_theme-1", "theme1"]) {
        expect(
          themeV4Schema.safeParse({
            ...DEFAULT_THEME,
            metadata: {
              ...DEFAULT_THEME.metadata,
              id
            }
          }).success
        ).toBe(true);
      }
    });

    it("rejects unsafe theme ids", ({ expect }) => {
      for (const id of ["BadTheme", "bad theme", "bad[theme]", 'bad"theme', "_preview"]) {
        expect(
          themeV4Schema.safeParse({
            ...DEFAULT_THEME,
            metadata: {
              ...DEFAULT_THEME.metadata,
              id
            }
          }).success
        ).toBe(false);
      }
    });
  });

  describe.concurrent("partialThemeV4Schema", () => {
    it("accepts an empty object", ({ expect }) => {
      expect(partialThemeV4Schema.safeParse({}).success).toBe(true);
    });

    it("accepts partial css vars", ({ expect }) => {
      const result = partialThemeV4Schema.safeParse({
        schema: 4,
        cssVars: {
          primary: "oklch(0.5 0.1 100)",
          accent2: "oklch(0.7 0.1 80)",
          accent3: "oklch(0.6 0.1 80)",
          accent4: "oklch(0.8 0.1 80)"
        }
      });

      expect(result.success).toBe(true);
    });

    it("accepts partial extras", ({ expect }) => {
      const result = partialThemeV4Schema.safeParse({
        schema: 4,
        extras: {
          minecraft: {
            palette: "true-colors",
            overrides: {
              a: "oklch(0.5 0.1 100)"
            }
          }
        }
      });

      expect(result.success).toBe(true);
    });

    it("rejects V3-style color fields", ({ expect }) => {
      const result = partialThemeV4Schema.safeParse({
        schema: 4,
        colors: {
          icon: "oklch(0.5 0.1 100)"
        }
      });

      expect(result.success).toBe(false);
    });
  });
});
