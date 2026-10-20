import type { Component } from "svelte";
import type { SettingsTab } from "#lib/components/header/types";

type SettingsTabItem = {
  type: "tab";
  value: string;
  label: string;
  keywords: string[];
  icon: Component<{ class?: string }>;
  tab: SettingsTab;
};

type SettingsToggleItem = {
  type: "toggle";
  value: string;
  label: string;
  keywords: string[];
  icon: Component<{ class?: string }>;
  preferenceKey: "performanceMode" | "showGlint" | "mctooltip";
  iconProps?: Record<string, unknown>;
};

export type SettingsConfigItem = SettingsTabItem | SettingsToggleItem;
