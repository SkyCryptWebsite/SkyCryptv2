import { DEFAULT_THEME, type ThemeV4 } from "$lib/shared/themes";
import * as devalue from "devalue";
import { flushSync, untrack } from "svelte";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { ThemeContext } from "./themes.svelte";

function customTheme(id = "custom"): ThemeV4 {
  return {
    ...DEFAULT_THEME,
    metadata: {
      ...DEFAULT_THEME.metadata,
      id,
      name: "Custom Theme",
      author: "Tester"
    },
    cssVars: {
      primary: "oklch(0.5 0.1 100)"
    }
  };
}

describe("ThemeContext", () => {
  const originalStartViewTransition = document.startViewTransition;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: originalStartViewTransition,
      writable: true
    });
  });

  it("resolves first-party themes", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const themes = new ThemeContext();

      untrack(() => {
        expect(themes.activeTheme?.metadata.id).toBe("default");
        expect(themes.isFirstParty("default")).toBe(true);
        expect(themes.allThemes).toHaveLength(1);
      });
    });

    cleanup();
  });

  it("filters persisted V3 custom themes", ({ expect }) => {
    localStorage.setItem(
      "skycryptThemes",
      devalue.stringify([
        {
          schema: 3,
          colors: {
            icon: "oklch(0.5 0.1 100)"
          }
        },
        customTheme()
      ])
    );

    const cleanup = $effect.root(() => {
      const themes = new ThemeContext();
      flushSync();

      untrack(() => {
        expect(themes.userThemes).toHaveLength(1);
        expect(themes.userThemes[0].metadata.id).toBe("custom");
      });
    });

    cleanup();
  });

  it("resets malformed persisted custom themes", ({ expect }) => {
    localStorage.setItem("skycryptThemes", JSON.stringify([customTheme()]));
    localStorage.setItem("skycryptActiveTheme", "custom");

    const cleanup = $effect.root(() => {
      const themes = new ThemeContext();
      flushSync();

      untrack(() => {
        expect(themes.userThemes).toHaveLength(0);
        expect(themes.activeThemeId).toBe("default");
      });
    });

    cleanup();
  });

  it("falls back to default when active custom theme is missing", ({ expect }) => {
    localStorage.setItem("skycryptActiveTheme", devalue.stringify("missing-theme"));

    const cleanup = $effect.root(() => {
      const themes = new ThemeContext();
      flushSync();

      untrack(() => {
        expect(themes.activeThemeId).toBe("default");
        expect(themes.activeTheme?.metadata.id).toBe("default");
      });
    });

    cleanup();
  });

  it("prevents saving over first-party themes", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const themes = new ThemeContext();

      untrack(() => {
        themes.saveTheme({
          ...customTheme("default"),
          metadata: {
            ...customTheme("default").metadata,
            id: "default"
          }
        });

        expect(themes.userThemes).toHaveLength(0);
      });
    });

    cleanup();
  });

  it("ignores skipped view transition rejections when selecting a theme", async ({ expect }) => {
    const startViewTransition = vi.fn((callback: () => void) => {
      callback();

      return {
        ready: Promise.reject(new DOMException("Transition was skipped", "AbortError")),
        finished: Promise.reject(new DOMException("Transition was skipped", "AbortError")),
        updateCallbackDone: Promise.resolve(),
        skipTransition: vi.fn()
      };
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
      writable: true
    });

    const cleanup = $effect.root(() => {
      const themes = new ThemeContext();
      flushSync();

      untrack(() => {
        themes.saveTheme(customTheme("custom-transition"));
        themes.activeThemeId = "custom-transition";
      });
    });

    await Promise.resolve();

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalledWith("Theme transition failed", expect.anything());

    warn.mockRestore();
    cleanup();
  });
});
