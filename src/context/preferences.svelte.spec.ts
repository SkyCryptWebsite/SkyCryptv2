import { flushSync, untrack } from "svelte";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { sections } from "#lib/sections/constants";
import type { SectionID } from "#lib/sections/types";
import { PreferencesContext } from "./preferences.svelte";

describe("PreferencesContext Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.performance;
    delete document.documentElement.dataset.rainbow;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (() => ({}) as WebGL2RenderingContext) as unknown as typeof HTMLCanvasElement.prototype.getContext
    );
  });

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.performance;
    delete document.documentElement.dataset.rainbow;
    vi.restoreAllMocks();
  });

  describe("PersistedState localStorage", () => {
    it("persists sectionOrder to localStorage", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          prefs.sectionOrder = [sections[1], sections[0], sections[2]];
          flushSync();

          const stored = localStorage.getItem("skycryptPreferences");
          expect(stored).toBeTruthy();
          const parsed = JSON.parse(stored!);
          expect(parsed.sectionOrder).toHaveLength(sections.length);
          expect(parsed.sectionOrder[0].id).toBe(sections[1].id);
          expect(parsed.sectionOrder[1].id).toBe(sections[0].id);
          expect(parsed.sectionOrder[2].id).toBe(sections[2].id);
        });
      });

      cleanup();
    });

    it("loads persisted values from localStorage on new instance", ({ expect }) => {
      localStorage.setItem(
        "skycryptPreferences",
        JSON.stringify({
          sectionOrder: sections,
          performanceMode: true,
          keybind: "s",
          showGlint: false,
          rainbowEnchantments: false,
          mctooltip: false
        })
      );

      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          expect(prefs.performanceMode).toBe(true);
          expect(prefs.keybind).toBe("s");
          expect(prefs.showGlint).toBe(false);
        });
      });

      cleanup();
    });

    it("handles multiple property updates maintaining state", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          prefs.performanceMode = true;
          prefs.keybind = "m";
          prefs.showGlint = false;
          prefs.rainbowEnchantments = true;
          prefs.mctooltip = true;
          flushSync();

          const stored = localStorage.getItem("skycryptPreferences");
          const parsed = JSON.parse(stored!);
          expect(parsed.performanceMode).toBe(true);
          expect(parsed.keybind).toBe("m");
          expect(parsed.showGlint).toBe(false);
          expect(parsed.rainbowEnchantments).toBe(true);
          expect(parsed.mctooltip).toBe(true);
        });
      });

      cleanup();
    });
  });

  describe("sectionOrder Setter Validation", () => {
    it("filters out invalid section IDs", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalid = { id: 999, name: "Invalid" as any };
          prefs.sectionOrder = [sections[0], invalid, sections[1]];
          flushSync();

          expect(prefs.sectionOrder).toHaveLength(sections.length);
          expect(prefs.sectionOrder[0].id).toBe(sections[0].id);
          expect(prefs.sectionOrder[1].id).toBe(sections[1].id);
        });
      });

      cleanup();
    });

    it("handles empty array", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          prefs.sectionOrder = [];
          flushSync();

          expect(prefs.sectionOrder).toHaveLength(sections.length);
          expect(prefs.sectionOrder[0].id).toBe(sections[0].id);
        });
      });

      cleanup();
    });
  });

  describe("rainbowEnchantments document.dataset", () => {
    it("updates document.dataset on toggle", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          prefs.rainbowEnchantments = true;
          flushSync();
          const first = document.documentElement.dataset.rainbow;

          prefs.rainbowEnchantments = false;
          flushSync();
          const second = document.documentElement.dataset.rainbow;

          prefs.rainbowEnchantments = true;
          flushSync();
          const third = document.documentElement.dataset.rainbow;

          expect(first).toBe("true");
          expect(second).toBe("false");
          expect(third).toBe("true");
        });
      });

      cleanup();
    });

    it("applies rainbow setting on construction via $effect.pre", ({ expect }) => {
      localStorage.setItem(
        "skycryptPreferences",
        JSON.stringify({
          sectionOrder: sections,
          performanceMode: false,
          keybind: "/",
          showGlint: true,
          rainbowEnchantments: true,
          mctooltip: false
        })
      );

      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          flushSync();
          expect(document.documentElement.dataset.rainbow).toBe("true");
          expect(prefs.rainbowEnchantments).toBe(true);
        });
      });

      cleanup();
    });
  });

  describe("performanceMode document.dataset", () => {
    it("sets document.documentElement.dataset.performance to 'false' by default", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          flushSync();

          expect(prefs.performanceMode).toBe(false);
          expect(document.documentElement.dataset.performance).toBe("false");
        });
      });

      cleanup();
    });

    it("updates document.dataset on toggle", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          prefs.performanceMode = true;
          flushSync();
          const first = document.documentElement.dataset.performance;

          prefs.performanceMode = false;
          flushSync();
          const second = document.documentElement.dataset.performance;

          prefs.performanceMode = true;
          flushSync();
          const third = document.documentElement.dataset.performance;

          expect(first).toBe("true");
          expect(second).toBe("false");
          expect(third).toBe("true");
        });
      });

      cleanup();
    });

    it("applies performance setting on construction via $effect.pre", ({ expect }) => {
      localStorage.setItem(
        "skycryptPreferences",
        JSON.stringify({
          sectionOrder: sections,
          performanceMode: true,
          keybind: "/",
          showGlint: true,
          rainbowEnchantments: false,
          mctooltip: false
        })
      );

      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          flushSync();
          expect(document.documentElement.dataset.performance).toBe("true");
          expect(prefs.performanceMode).toBe(true);
        });
      });

      cleanup();
    });
  });

  describe("graphics acceleration lock", () => {
    it("forces Performance Mode without overwriting the saved preference", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          prefs.setGraphicsAccelerationAvailable(true);
          prefs.performanceMode = false;
          prefs.setGraphicsAccelerationAvailable(false);
          flushSync();

          expect(prefs.graphicsAccelerationAvailable).toBe(false);
          expect(prefs.performanceModeForced).toBe(true);
          expect(prefs.performanceMode).toBe(true);
          expect(document.documentElement.dataset.performance).toBe("true");
          expect(JSON.parse(localStorage.getItem("skycryptPreferences")!).performanceMode).toBe(false);
        });
      });

      cleanup();
    });

    it("ignores attempts to disable a forced Performance Mode", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          prefs.setGraphicsAccelerationAvailable(false);
          prefs.performanceMode = false;
          flushSync();

          expect(prefs.performanceMode).toBe(true);
          expect(document.documentElement.dataset.performance).toBe("true");
        });
      });

      cleanup();
    });

    it("restores the saved preference when acceleration becomes available", ({ expect }) => {
      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          prefs.setGraphicsAccelerationAvailable(true);
          prefs.performanceMode = false;
          prefs.setGraphicsAccelerationAvailable(false);
          prefs.setGraphicsAccelerationAvailable(true);
          flushSync();

          expect(prefs.performanceModeForced).toBe(false);
          expect(prefs.performanceMode).toBe(false);
          expect(document.documentElement.dataset.performance).toBe("false");
        });
      });

      cleanup();
    });
  });

  describe("Migration via loadOldSettings", () => {
    it("migrates sectionOrderPreferences from old storage key", ({ expect }) => {
      const oldOrder: SectionID[] = [sections[2], sections[1], sections[0]];
      localStorage.setItem("sectionOrderPreferences", JSON.stringify(oldOrder));

      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          flushSync();
          expect(prefs.sectionOrder[0].id).toBe(sections[2].id);
          expect(localStorage.getItem("sectionOrderPreferences")).toBeNull();
        });
      });

      cleanup();
    });

    it("migrates performanceMode from old storage key (boolean)", ({ expect }) => {
      localStorage.setItem("performanceMode", JSON.stringify(true));

      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          flushSync();
          expect(prefs.performanceMode).toBe(true);
          expect(document.documentElement.dataset.performance).toBe("true");
          expect(localStorage.getItem("performanceMode")).toBeNull();
        });
      });

      cleanup();
    });

    it("migrates performanceMode from old storage key (string)", ({ expect }) => {
      localStorage.setItem("performanceMode", "true");

      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          flushSync();
          expect(prefs.performanceMode).toBe(true);
          expect(document.documentElement.dataset.performance).toBe("true");
          expect(localStorage.getItem("performanceMode")).toBeNull();
        });
      });

      cleanup();
    });

    it("migrates multiple old settings at once", ({ expect }) => {
      localStorage.setItem("performanceMode", "true");
      localStorage.setItem("keybind", "x");
      localStorage.setItem("rainbowEnchantments", JSON.stringify(true));

      const cleanup = $effect.root(() => {
        const prefs = new PreferencesContext();

        untrack(() => {
          flushSync();
          expect(prefs.performanceMode).toBe(true);
          expect(prefs.keybind).toBe("x");
          expect(prefs.rainbowEnchantments).toBe(true);

          expect(localStorage.getItem("performanceMode")).toBeNull();
          expect(localStorage.getItem("keybind")).toBeNull();
          expect(localStorage.getItem("rainbowEnchantments")).toBeNull();
        });
      });

      cleanup();
    });
  });
});
