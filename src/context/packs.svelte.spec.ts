import type { ModelsResourcePackConfig } from "$lib/shared/api/orval-generated";
import { readEnabledPacksCookie } from "$lib/shared/resource-packs";
import { flushSync, untrack } from "svelte";
import { afterEach, beforeEach, describe, it } from "vitest";
import { EnabledPacksContext, reconcileEnabledPacks } from "./packs.svelte";

const packs = [
  { id: "HYPIXEL_PLUS", name: "Hypixel Plus" },
  { id: "FSR", name: "FurSky Reborn" },
  { id: "HYPIXEL_PACK", name: "Hypixel SkyBlock" }
] satisfies ModelsResourcePackConfig[];

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

describe("EnabledPacksContext", () => {
  beforeEach(() => {
    localStorage.clear();
    clearCookie("enabledPacks");
    clearCookie("disabledPacks");
  });

  afterEach(() => {
    localStorage.clear();
    clearCookie("enabledPacks");
    clearCookie("disabledPacks");
  });

  it("initializes every pack in API priority order", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const context = new EnabledPacksContext();

      untrack(() => {
        context.configure(packs);
        flushSync();

        expect(context.current).toEqual(["HYPIXEL_PLUS", "FSR", "HYPIXEL_PACK"]);
        expect(context.initialized).toBe(true);
        expect(context.hasChanged).toBe(false);
        expect(readEnabledPacksCookie()).toEqual(context.current);
      });
    });

    cleanup();
  });

  it("persists ordered changes and treats order as significant", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const context = new EnabledPacksContext();

      untrack(() => {
        context.configure(packs);
        context.current = ["FSR", "HYPIXEL_PLUS", "HYPIXEL_PACK"];
        flushSync();

        expect(context.current).toEqual(["FSR", "HYPIXEL_PLUS", "HYPIXEL_PACK"]);
        expect(context.hasChanged).toBe(true);
        expect(JSON.parse(localStorage.getItem("skycryptEnabledPacks")!)).toEqual(context.current);
        expect(readEnabledPacksCookie()).toEqual(context.current);
      });
    });

    cleanup();
  });

  it("preserves an explicit empty allow-list", ({ expect }) => {
    localStorage.setItem("skycryptEnabledPacks", "[]");

    const cleanup = $effect.root(() => {
      const context = new EnabledPacksContext();

      untrack(() => {
        context.configure(packs);
        flushSync();

        expect(context.current).toEqual([]);
        expect(readEnabledPacksCookie()).toEqual([]);
      });
    });

    cleanup();
  });

  it("persists an explicit empty allow-list", ({ expect }) => {
    const cleanup = $effect.root(() => {
      const context = new EnabledPacksContext();

      untrack(() => {
        context.configure(packs);
        context.current = [];
        flushSync();

        expect(context.current).toEqual([]);
        expect(context.hasChanged).toBe(true);
        expect(JSON.parse(localStorage.getItem("skycryptEnabledPacks")!)).toEqual([]);
        expect(readEnabledPacksCookie()).toEqual([]);
      });
    });

    cleanup();
  });

  it("loads an existing enabledPacks cookie when persisted state is absent", ({ expect }) => {
    document.cookie = `enabledPacks=${encodeURIComponent(JSON.stringify(["FSR", "HYPIXEL_PLUS"]))}; path=/`;

    const cleanup = $effect.root(() => {
      const context = new EnabledPacksContext();

      untrack(() => {
        context.configure(packs);
        flushSync();

        expect(context.current).toEqual(["FSR", "HYPIXEL_PLUS"]);
      });
    });

    cleanup();
  });

  it("migrates all legacy disabled-pack sources and removes them", ({ expect }) => {
    localStorage.setItem("skycryptDisabledPacks", JSON.stringify(["FSR"]));
    localStorage.setItem("disabledPacks", JSON.stringify(["HYPIXEL_PACK"]));
    document.cookie = `disabledPacks=${encodeURIComponent(JSON.stringify(["FSR"]))}; path=/`;

    const cleanup = $effect.root(() => {
      const context = new EnabledPacksContext();

      untrack(() => {
        context.configure(packs);
        flushSync();

        expect(context.current).toEqual(["HYPIXEL_PLUS"]);
        expect(localStorage.getItem("skycryptDisabledPacks")).toBeNull();
        expect(localStorage.getItem("disabledPacks")).toBeNull();
        expect(document.cookie).not.toContain("disabledPacks=");
      });
    });

    cleanup();
  });

  it("keeps new packs disabled for an existing explicit preference", ({ expect }) => {
    localStorage.setItem("skycryptEnabledPacks", JSON.stringify(["FSR"]));

    const cleanup = $effect.root(() => {
      const context = new EnabledPacksContext();

      untrack(() => {
        context.configure([...packs, { id: "NEW_PACK", name: "New Pack" }]);
        flushSync();

        expect(context.current).toEqual(["FSR"]);
      });
    });

    cleanup();
  });

  it("removes stale and duplicate IDs without changing relative order", ({ expect }) => {
    expect(
      reconcileEnabledPacks(
        ["FSR", "REMOVED_PACK", "HYPIXEL_PLUS", "FSR"],
        packs.flatMap((pack) => (pack.id ? [pack.id] : []))
      )
    ).toEqual(["FSR", "HYPIXEL_PLUS"]);
  });
});
