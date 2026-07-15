import { browser } from "$app/environment";
import type { ModelsResourcePackConfig } from "$lib/shared/api/orval-generated";
import {
  readEnabledPacksCookie,
  readLegacyDisabledPacksCookie,
  removeLegacyDisabledPacksCookie,
  writeEnabledPacksCookie
} from "$lib/shared/resource-packs";
import { PersistedState } from "runed";
import { createContext } from "svelte";
import { SvelteSet } from "svelte/reactivity";

type EnabledPacksData = string;

const ENABLED_PACKS_STORAGE_KEY = "skycryptEnabledPacks";
const LEGACY_DISABLED_PACKS_STORAGE_KEYS = ["skycryptDisabledPacks", "disabledPacks"];

function readStoredPackIds(key: string): string[] | null {
  if (!browser) return null;

  const value = localStorage.getItem(key);
  if (value === null) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === "string")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function reconcileEnabledPacks(enabledPacks: string[], availablePackIds: string[]): string[] {
  const available = new SvelteSet(availablePackIds);
  const seen = new SvelteSet<string>();

  return enabledPacks.filter((packId) => {
    if (!available.has(packId) || seen.has(packId)) return false;
    seen.add(packId);
    return true;
  });
}

export class EnabledPacksContext {
  #data = new PersistedState<EnabledPacksData[] | null>(ENABLED_PACKS_STORAGE_KEY, null);
  #initial = $state<EnabledPacksData[] | null>(null);
  #initialized = $state(false);

  get current() {
    return this.#data.current ?? [];
  }

  set current(value: EnabledPacksData[]) {
    const normalized = [...new SvelteSet(value)];
    this.#data.current = normalized;
    writeEnabledPacksCookie(normalized);
  }

  get initialized() {
    return this.#initialized;
  }

  get hasChanged() {
    return this.#initial !== null && JSON.stringify(this.current) !== JSON.stringify(this.#initial);
  }

  configure(resourcePacks: ModelsResourcePackConfig[]) {
    if (!browser || this.#initialized) return;

    const defaultPackIds = resourcePacks.flatMap((pack) => (pack.id ? [pack.id] : []));
    const persistedEnabledPacks = this.#data.current;
    const cookieEnabledPacks = readEnabledPacksCookie();
    const legacyDisabledPacks = this.readLegacyDisabledPacks();

    const configuredPacks =
      persistedEnabledPacks ??
      cookieEnabledPacks ??
      (legacyDisabledPacks ? defaultPackIds.filter((packId) => !legacyDisabledPacks.includes(packId)) : defaultPackIds);

    const reconciledPacks = reconcileEnabledPacks(configuredPacks, defaultPackIds);
    this.#data.current = reconciledPacks;
    this.#initial = [...reconciledPacks];
    this.#initialized = true;
    writeEnabledPacksCookie(reconciledPacks);
    this.removeLegacyDisabledPacks();
  }

  private readLegacyDisabledPacks(): string[] | null {
    const values = [
      ...LEGACY_DISABLED_PACKS_STORAGE_KEYS.flatMap((key) => readStoredPackIds(key) ?? []),
      ...(readLegacyDisabledPacksCookie() ?? [])
    ];

    return values.length > 0 ? [...new SvelteSet(values)] : null;
  }

  private removeLegacyDisabledPacks(): void {
    for (const key of LEGACY_DISABLED_PACKS_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    removeLegacyDisabledPacksCookie();
  }
}

const [getEnabledPacks, setEnabledPacks] = createContext<EnabledPacksContext>();

function initEnabledPacks() {
  const enabledPacks = new EnabledPacksContext();
  setEnabledPacks(enabledPacks);
  return enabledPacks;
}

export { getEnabledPacks, initEnabledPacks };
