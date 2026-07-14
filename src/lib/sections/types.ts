import type { Component } from "svelte";

export type SectionName =
  | "Gear"
  | "Accessories"
  | "Pets"
  | "Inventory"
  | "Skills"
  | "Dungeons"
  | "Slayer"
  | "Minions"
  | "Bestiary"
  | "Collections"
  | "Crimson_Isle"
  | "Rift"
  | "Misc";

export type SectionComponents = Record<SectionName, Promise<{ default: Component }> | null>;
export type SectionComponentsEager = Record<SectionName, Component | null>;

export type SectionID = { id: number; name: SectionName };
