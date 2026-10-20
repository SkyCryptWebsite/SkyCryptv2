import { createContext } from "svelte";
import type { z } from "zod";
import type { IsHover } from "#lib/hooks/is-hover.svelte.js";
import type { IsMobile } from "#lib/hooks/is-mobile.svelte.js";
import type {
  ModelsCombinedOutput,
  ModelsMiscOutput,
  ModelsResourcePackConfig,
  ModelsStatData,
  ModelsSkillsOutput,
  ModelsStatsOutput
} from "#lib/shared/api/orval-generated";
import type { ListEnchantmentsResponse } from "#lib/shared/api/orval-generated-zod";

export type Enchantments = z.infer<typeof ListEnchantmentsResponse>;

export class ProfileContext {
  #current: ModelsStatsOutput | null = $state.raw(null);

  get current() {
    return this.#current;
  }

  set current(value: ModelsStatsOutput | null) {
    this.#current = value;
  }
}

export class AllStatsContext {
  #current: ModelsStatData[] = $state.raw([]);

  get current() {
    return this.#current;
  }

  set current(value: ModelsStatData[]) {
    this.#current = value;
  }
}

export class EnchantmentsContext {
  #current: Enchantments = $state.raw([]);

  get current() {
    return this.#current;
  }

  set current(value: Enchantments) {
    this.#current = value;
  }
}

export class CombinedContext {
  #current: ModelsCombinedOutput | null = $state.raw(null);

  get current() {
    return this.#current;
  }

  set current(value: ModelsCombinedOutput | null) {
    this.#current = value;
  }
}

export class PacksContext {
  #packs: ModelsResourcePackConfig[] = $state.raw([]);

  get packs() {
    return this.#packs;
  }

  set packs(value: ModelsResourcePackConfig[]) {
    this.#packs = value;
  }
}

export class MiscContext {
  #misc: ModelsMiscOutput | null = $state.raw(null);

  get misc() {
    return this.#misc;
  }

  set misc(value: ModelsMiscOutput | null) {
    this.#misc = value;
  }
}

export class SkillsContext {
  #skills: ModelsSkillsOutput | null = $state.raw(null);

  get skills() {
    return this.#skills;
  }

  set skills(value: ModelsSkillsOutput | null) {
    this.#skills = value;
  }
}

export const [getProfileContext, setProfileContext] = createContext<ProfileContext>();
export const [getAllStatsContext, setAllStatsContext] = createContext<AllStatsContext>();
export const [getEnchantmentsContext, setEnchantmentsContext] = createContext<EnchantmentsContext>();
export const [getCombinedContext, setCombinedContext] = createContext<CombinedContext>();
export const [getSkillsContext, setSkillsContext] = createContext<SkillsContext>();
export const [getMiscContext, setMiscContext] = createContext<MiscContext>();
export const [getMobileContext, setMobileContext] = createContext<IsMobile>();
export const [getHoverContext, setHoverContext] = createContext<IsHover>();
export const [getPacksContext, setPacksContext] = createContext<PacksContext>();
