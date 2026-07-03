// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { DEFAULT_THEME } from "./defaults";
import { mergeThemeWithDefaults, PREVIEW_THEME_ID, RUNTIME_THEMES_STYLE_ID, ThemeEngine } from "./engine";
import type { PartialThemeV5, ThemeV5 } from "./schema";

const modeWatcherMock = vi.hoisted(() => ({
  setTheme: vi.fn((id: string) => {
    document.documentElement.setAttribute("data-theme", id);
  })
}));

vi.mock("mode-watcher", () => ({
  setTheme: modeWatcherMock.setTheme
}));

function customTheme(id = "custom-theme"): ThemeV5 {
  return {
    ...DEFAULT_THEME,
    metadata: {
      ...DEFAULT_THEME.metadata,
      id,
      name: "Custom Theme",
      author: "Tester"
    },
    modes: {
      dark: {
        cssVars: {
          primary: "oklch(0.5 0.1 100)",
          accent3: "oklch(0.6 0.1 80)",
          radius: "1rem"
        },
        extras: {
          minecraft: {
            palette: "nice-dark",
            overrides: {
              a: "oklch(0.9 0.1 100)"
            }
          },
          pageBackground: {
            url: "https://example.com/bg.png"
          },
          enchantedGlint: "https://example.com/glint.png"
        }
      },
      light: {
        cssVars: {
          primary: "oklch(0.7 0.1 100)"
        }
      }
    }
  };
}

function withDarkExtras(theme: ThemeV5, extras: ThemeV5["modes"]["dark"]["extras"]): ThemeV5 {
  return {
    ...theme,
    modes: {
      ...theme.modes,
      dark: {
        ...theme.modes.dark,
        extras
      }
    }
  };
}

function runtimeStyle(): HTMLStyleElement | null {
  return document.getElementById(RUNTIME_THEMES_STYLE_ID) as HTMLStyleElement | null;
}

describe("Theme Engine", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.documentElement.removeAttribute("data-theme");
    modeWatcherMock.setTheme.mockClear();
  });

  afterEach(() => {
    document.head.innerHTML = "";
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
  });

  describe("mergeThemeWithDefaults", () => {
    it("preserves partial css vars without filling from defaults", ({ expect }) => {
      const merged = mergeThemeWithDefaults({
        modes: {
          dark: {
            cssVars: {
              primary: "oklch(0.5 0.1 100)"
            }
          }
        }
      });

      expect(merged.schema).toBe(5);
      expect(merged.modes.dark.cssVars.primary).toBe("oklch(0.5 0.1 100)");
      expect(merged.modes.dark.cssVars.background).toBeUndefined();
      expect(merged.modes.light.cssVars).toEqual({});
      expect(merged.metadata.id).toBe(DEFAULT_THEME.metadata.id);
    });

    it("merges metadata and per-mode extras", ({ expect }) => {
      const partial: PartialThemeV5 = {
        metadata: {
          id: "custom",
          name: "Custom"
        },
        modes: {
          light: {
            extras: {
              minecraft: {
                palette: "true-colors"
              },
              pageBackground: {
                url: "https://example.com/bg.png"
              }
            }
          }
        }
      };

      const merged = mergeThemeWithDefaults(partial);

      expect(merged.metadata.id).toBe("custom");
      expect(merged.metadata.name).toBe("Custom");
      expect(merged.metadata.author).toBe(DEFAULT_THEME.metadata.author);
      expect(merged.modes.light.extras?.minecraft?.palette).toBe("true-colors");
      expect(merged.modes.light.extras?.pageBackground?.url).toBe("https://example.com/bg.png");
      expect(merged.modes.dark.extras).toBeUndefined();
    });
  });

  describe("themeToCssRule", () => {
    it("serializes mode-scoped shadcn vars, Minecraft colors, background, and glint", ({ expect }) => {
      const rule = ThemeEngine.themeToCssRule(customTheme("test-theme"));

      expect(rule).toContain(':root[data-theme="test-theme"].dark');
      expect(rule).toContain(':root[data-theme="test-theme"].light');
      expect(rule.indexOf(':root[data-theme="test-theme"].dark')).toBeLessThan(rule.indexOf(':root[data-theme="test-theme"].light'));
      expect(rule).toContain("  --primary: oklch(0.5 0.1 100);");
      expect(rule).toContain("  --primary: oklch(0.7 0.1 100);");
      expect(rule).toContain("  --accent-3: oklch(0.6 0.1 80);");
      expect(rule).toContain("  --radius: 1rem;");
      expect(rule).toContain("  --§0: oklch(0 0 0);");
      expect(rule).toContain("  --§a: oklch(0.9 0.1 100);");
      expect(rule).toContain("  --bg-url: url(/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fbg.png);");
      expect(rule).toContain("  --enchanted-glint: url(/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fglint.png);");
    });

    it("uses local paths for first-party static images", ({ expect }) => {
      const rule = ThemeEngine.themeToCssRule(
        withDarkExtras(customTheme("first-party-assets"), {
          minecraft: {
            palette: "nice-light"
          },
          pageBackground: {
            url: "https://sky.shiiyu.moe/img/bg.avif"
          },
          enchantedGlint: "https://cupcake.shiiyu.moe/img/enchanted-glint-legacy.avif"
        })
      );

      expect(rule).toContain("  --bg-url: url(/img/bg.avif);");
      expect(rule).toContain("  --enchanted-glint: url(/img/enchanted-glint-legacy.avif);");
    });

    it("falls removed first-party theme images back to the default background", ({ expect }) => {
      const rule = ThemeEngine.themeToCssRule(
        withDarkExtras(customTheme("removed-first-party-assets"), {
          minecraft: {
            palette: "nice-light"
          },
          pageBackground: {
            url: "https://sky.shiiyu.moe/img/themes/light/bg.avif"
          }
        })
      );

      expect(rule).toContain("  --bg-url: url(/img/bg.avif);");
      expect(rule).not.toContain("/img/themes/light/bg.avif");
    });

    it("uses direct URLs for non-local first-party images", ({ expect }) => {
      const rule = ThemeEngine.themeToCssRule(
        withDarkExtras(customTheme("remote-first-party-assets"), {
          minecraft: {
            palette: "nice-light"
          },
          pageBackground: {
            url: "https://sky.shiiyu.moe/img/custom/user-bg.avif"
          }
        })
      );

      expect(rule).toContain("  --bg-url: url(https://sky.shiiyu.moe/img/custom/user-bg.avif);");
      expect(rule).not.toContain("/api/image-proxy");
    });

    it("omits undefined css vars", ({ expect }) => {
      const rule = ThemeEngine.themeToCssRule({
        ...customTheme("minimal-theme"),
        modes: {
          dark: {
            cssVars: {
              primary: "oklch(0.5 0.1 100)"
            }
          },
          light: {
            cssVars: {}
          }
        }
      });

      expect(rule).toContain("  --primary: oklch(0.5 0.1 100);");
      expect(rule).not.toContain("--foreground:");
    });

    it("throws for invalid theme ids", ({ expect }) => {
      expect(() =>
        ThemeEngine.themeToCssRule({
          ...customTheme("valid-theme"),
          metadata: {
            ...customTheme("valid-theme").metadata,
            id: "Bad Theme"
          }
        })
      ).toThrow("Cannot generate CSS for invalid theme");
    });
  });

  describe("runtime stylesheet", () => {
    it("creates and updates one managed style tag", ({ expect }) => {
      ThemeEngine.syncRuntimeThemes([customTheme("custom-a")]);
      const firstStyle = runtimeStyle();

      ThemeEngine.syncRuntimeThemes([customTheme("custom-b")]);
      const secondStyle = runtimeStyle();

      expect(firstStyle).toBeTruthy();
      expect(secondStyle).toBe(firstStyle);
      expect(document.querySelectorAll(`#${RUNTIME_THEMES_STYLE_ID}`)).toHaveLength(1);
      expect(secondStyle?.textContent).not.toContain("custom-a");
      expect(secondStyle?.textContent).toContain("custom-b");
    });

    it("excludes the CSS-defined default theme", ({ expect }) => {
      ThemeEngine.syncRuntimeThemes([DEFAULT_THEME, customTheme("custom-a")]);

      expect(runtimeStyle()?.textContent).not.toContain(':root[data-theme="default"]');
      expect(runtimeStyle()?.textContent).toContain(':root[data-theme="custom-a"].dark');
      expect(runtimeStyle()?.textContent).toContain(':root[data-theme="custom-a"].light');
    });

    it("removes deleted custom theme rules after resync", ({ expect }) => {
      ThemeEngine.syncRuntimeThemes([customTheme("custom-a"), customTheme("custom-b")]);
      ThemeEngine.syncRuntimeThemes([customTheme("custom-b")]);

      expect(runtimeStyle()?.textContent).not.toContain("custom-a");
      expect(runtimeStyle()?.textContent).toContain("custom-b");
    });

    it("keeps deterministic rule order", ({ expect }) => {
      ThemeEngine.syncRuntimeThemes([customTheme("custom-b"), customTheme("custom-a")]);

      const text = runtimeStyle()?.textContent ?? "";
      expect(text.indexOf("custom-a")).toBeLessThan(text.indexOf("custom-b"));
    });
  });

  describe("preview", () => {
    it("writes dark and light preview rules without activating the preview theme id", ({ expect }) => {
      ThemeEngine.previewTheme(customTheme("editable-theme"));

      const text = runtimeStyle()?.textContent ?? "";
      expect(text).toContain(`data-theme="${PREVIEW_THEME_ID}"].dark`);
      expect(text).toContain(`data-theme="${PREVIEW_THEME_ID}"].light`);
      expect(modeWatcherMock.setTheme).not.toHaveBeenCalled();
      expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    });

    it("activates the preview theme id separately", ({ expect }) => {
      ThemeEngine.activatePreviewTheme();

      expect(modeWatcherMock.setTheme).toHaveBeenCalledWith(PREVIEW_THEME_ID);
      expect(document.documentElement.getAttribute("data-theme")).toBe(PREVIEW_THEME_ID);
    });

    it("clears only the preview rule", ({ expect }) => {
      ThemeEngine.syncRuntimeThemes([customTheme("saved-theme")]);
      ThemeEngine.previewTheme(customTheme("editable-theme"));
      ThemeEngine.clearPreview();

      const text = runtimeStyle()?.textContent ?? "";
      expect(text).toContain("saved-theme");
      expect(text).not.toContain(PREVIEW_THEME_ID);
    });
  });
});
