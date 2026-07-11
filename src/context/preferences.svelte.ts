import { browser } from "$app/environment";
import { loadOldStorageKey } from "$ctx/utils";
import { sections } from "$lib/sections/constants";
import type { SectionID } from "$lib/sections/types";
import { isGraphicsAccelerationAvailable } from "$lib/shared/graphics-acceleration";
import { PersistedState } from "runed";
import { createContext, untrack } from "svelte";

interface PreferencesData {
  sectionOrder: SectionID[];
  performanceMode: boolean;
  keybind: string;
  showGlint: boolean;
  rainbowEnchantments: boolean;
  mctooltip: boolean;
}

export class PreferencesContext {
  #data = new PersistedState<PreferencesData>("skycryptPreferences", {
    sectionOrder: sections,
    performanceMode: false,
    keybind: "/",
    showGlint: true,
    rainbowEnchantments: false,
    mctooltip: false
  });
  #graphicsAccelerationAvailable = $state<boolean | null>(browser ? isGraphicsAccelerationAvailable() : null);

  constructor() {
    $effect.pre(() => {
      untrack(() => {
        this.loadOldSettings();
        this.sectionOrder = this.#data.current.sectionOrder;
        // Apply document-level styling flags on load.
        this.applyPerformanceMode();
        this.rainbowEnchantments = !!this.rainbowEnchantments;
      });
    });
  }

  get sectionOrder() {
    return this.#data.current.sectionOrder;
  }

  set sectionOrder(value: SectionID[]) {
    const newOrder = this.reconcileSectionOrder(value);
    this.#data.current = { ...this.#data.current, sectionOrder: newOrder };
  }

  reconcileSectionOrder(value: SectionID[]) {
    const newOrder: SectionID[] = [];
    const seenSectionIds: Record<number, true> = {};

    // Keep current user ordering for sections that still exist.
    for (const section of value) {
      const existing = sections.find((current) => current.id === section.id);
      if (!existing || seenSectionIds[existing.id]) continue;

      seenSectionIds[existing.id] = true;
      newOrder.push({ ...existing });
    }

    // Append newly added sections to avoid requiring localStorage resets.
    for (const section of sections) {
      if (seenSectionIds[section.id]) continue;

      seenSectionIds[section.id] = true;
      newOrder.push({ ...section });
    }

    return newOrder;
  }

  get performanceMode() {
    return this.#data.current.performanceMode || this.performanceModeForced;
  }

  set performanceMode(value: boolean) {
    if (!value && this.performanceModeForced) return;
    this.#data.current = { ...this.#data.current, performanceMode: value };
    this.applyPerformanceMode();
  }

  get graphicsAccelerationAvailable() {
    return this.#graphicsAccelerationAvailable;
  }

  get performanceModeForced() {
    return this.#graphicsAccelerationAvailable === false;
  }

  setGraphicsAccelerationAvailable(available: boolean) {
    this.#graphicsAccelerationAvailable = available;
    this.applyPerformanceMode();
  }

  applyPerformanceMode() {
    if (browser) {
      document.documentElement.dataset.performance = this.performanceMode ? "true" : "false";
    }
  }

  get keybind() {
    return this.#data.current.keybind;
  }

  set keybind(value: string) {
    this.#data.current = { ...this.#data.current, keybind: value };
  }

  get showGlint() {
    return this.#data.current.showGlint;
  }

  set showGlint(value: boolean) {
    this.#data.current = { ...this.#data.current, showGlint: value };
  }

  get rainbowEnchantments() {
    return this.#data.current.rainbowEnchantments;
  }

  set rainbowEnchantments(value: boolean) {
    this.#data.current = { ...this.#data.current, rainbowEnchantments: value };
    if (browser) {
      document.documentElement.dataset.rainbow = value ? "true" : "false";
    }
  }

  get mctooltip() {
    return this.#data.current.mctooltip;
  }

  set mctooltip(value: boolean) {
    this.#data.current = { ...this.#data.current, mctooltip: value };
  }

  loadOldSettings() {
    loadOldStorageKey("sectionOrderPreferences", (value: SectionID[]) => {
      this.sectionOrder = value;
    });
    loadOldStorageKey("performanceMode", (value: boolean) => {
      this.performanceMode = typeof value === "string" ? value === "true" : value;
    });
    loadOldStorageKey("keybind", (value: string) => {
      this.keybind = value;
    });
    loadOldStorageKey("showGlint", (value: boolean) => {
      this.showGlint = typeof value === "string" ? value === "true" : value;
    });
    loadOldStorageKey("rainbowEnchantments", (value: boolean) => {
      this.rainbowEnchantments = typeof value === "string" ? value === "true" : value;
    });
  }
}

const [getPreferences, setPreferences] = createContext<PreferencesContext>();

function initPreferences() {
  const preferences = new PreferencesContext();
  setPreferences(preferences);
  return preferences;
}

export { getPreferences, initPreferences };
