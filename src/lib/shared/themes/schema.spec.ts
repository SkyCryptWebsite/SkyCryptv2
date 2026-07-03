import { describe, it } from "vitest";
import { DEFAULT_THEME } from "./defaults";
import { legacyThemeV4Schema, migrateThemeV4ToV5, partialThemeV5Schema, themeV5Schema } from "./schema";

describe.concurrent("Theme V5 Schema Validation", () => {
  describe.concurrent("themeV5Schema", () => {
    it("parses a valid full theme", ({ expect }) => {
      const result = themeV5Schema.safeParse(DEFAULT_THEME);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.schema).toBe(5);
        expect(result.data.metadata.id).toBe("default");
        expect(result.data.modes.dark.cssVars).toEqual({});
        expect(result.data.modes.light.cssVars).toEqual({});
      }
    });

    it("rejects an invalid color", ({ expect }) => {
      const result = themeV5Schema.safeParse({
        ...DEFAULT_THEME,
        modes: {
          ...DEFAULT_THEME.modes,
          dark: {
            cssVars: {
              primary: "not-a-color"
            }
          }
        }
      });

      expect(result.success).toBe(false);
    });

    it("rejects an HTTP page background URL", ({ expect }) => {
      const result = themeV5Schema.safeParse({
        ...DEFAULT_THEME,
        modes: {
          ...DEFAULT_THEME.modes,
          light: {
            cssVars: {},
            extras: {
              pageBackground: {
                url: "http://example.com/bg.jpg"
              }
            }
          }
        }
      });

      expect(result.success).toBe(false);
    });

    it("rejects V4-style top-level mode and css vars", ({ expect }) => {
      const result = themeV5Schema.safeParse({
        ...DEFAULT_THEME,
        mode: "dark",
        cssVars: {
          primary: "oklch(0.5 0.1 100)"
        }
      });

      expect(result.success).toBe(false);
    });

    it("rejects invalid Minecraft override keys", ({ expect }) => {
      const result = themeV5Schema.safeParse({
        ...DEFAULT_THEME,
        modes: {
          ...DEFAULT_THEME.modes,
          dark: {
            cssVars: {},
            extras: {
              minecraft: {
                palette: "nice-light",
                overrides: {
                  z: "oklch(0.5 0.1 100)"
                }
              }
            }
          }
        }
      });

      expect(result.success).toBe(false);
    });

    it("accepts generated lowercase theme ids", ({ expect }) => {
      for (const id of ["custom-1780000000000", "custom_theme-1", "theme1"]) {
        expect(
          themeV5Schema.safeParse({
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
          themeV5Schema.safeParse({
            ...DEFAULT_THEME,
            metadata: {
              ...DEFAULT_THEME.metadata,
              id
            }
          }).success
        ).toBe(false);
      }
    });

    it("requires both mode definitions", ({ expect }) => {
      const result = themeV5Schema.safeParse({
        ...DEFAULT_THEME,
        modes: {
          dark: {
            cssVars: {}
          }
        }
      });

      expect(result.success).toBe(false);
    });
  });

  describe.concurrent("partialThemeV5Schema", () => {
    it("accepts an empty object", ({ expect }) => {
      expect(partialThemeV5Schema.safeParse({}).success).toBe(true);
    });

    it("accepts partial css vars", ({ expect }) => {
      const result = partialThemeV5Schema.safeParse({
        schema: 5,
        modes: {
          dark: {
            cssVars: {
              primary: "oklch(0.5 0.1 100)",
              accent2: "oklch(0.7 0.1 80)",
              accent3: "oklch(0.6 0.1 80)",
              accent4: "oklch(0.8 0.1 80)"
            }
          }
        }
      });

      expect(result.success).toBe(true);
    });

    it("accepts partial extras", ({ expect }) => {
      const result = partialThemeV5Schema.safeParse({
        schema: 5,
        modes: {
          light: {
            extras: {
              minecraft: {
                palette: "true-colors",
                overrides: {
                  a: "oklch(0.5 0.1 100)"
                }
              }
            }
          }
        }
      });

      expect(result.success).toBe(true);
    });

    it("rejects V3-style color fields", ({ expect }) => {
      const result = partialThemeV5Schema.safeParse({
        schema: 5,
        colors: {
          icon: "oklch(0.5 0.1 100)"
        }
      });

      expect(result.success).toBe(false);
    });
  });

  describe.concurrent("legacy V4 migration", () => {
    it("preserves authored dark mode and leaves light mode empty", ({ expect }) => {
      const v4 = legacyThemeV4Schema.parse({
        schema: 4,
        mode: "dark",
        cssVars: {
          primary: "oklch(0.5 0.1 100)"
        },
        extras: {
          pageBackground: {
            url: "https://example.com/bg.png"
          }
        },
        metadata: DEFAULT_THEME.metadata
      });

      const migrated = migrateThemeV4ToV5(v4);

      expect(migrated.schema).toBe(5);
      expect(migrated.modes.dark.cssVars.primary).toBe("oklch(0.5 0.1 100)");
      expect(migrated.modes.dark.extras?.pageBackground?.url).toBe("https://example.com/bg.png");
      expect(migrated.modes.light.cssVars).toEqual({});
      expect(migrated.modes.light.extras).toBeUndefined();
    });
  });
});
