<script lang="ts">
  import { getInternalState, getPreferences } from "$ctx";
  import { SettingsTab } from "$lib/components/header/types";
  import * as Command from "$ui/command";
  import Fan from "@lucide/svelte/icons/fan";
  import Keyboard from "@lucide/svelte/icons/keyboard";
  import ListOrdered from "@lucide/svelte/icons/list-ordered";
  import PackageOpen from "@lucide/svelte/icons/package-open";
  import PaintBucket from "@lucide/svelte/icons/paint-bucket";
  import Pickaxe from "@lucide/svelte/icons/pickaxe";
  import Sparkle from "@lucide/svelte/icons/sparkle";
  import type { SettingsConfigItem } from "./command-utils";

  const { closeCommand }: { closeCommand: () => void } = $props();

  const preferences = getPreferences();
  const internalState = getInternalState();

  function handleSettingTab(tab: SettingsTab) {
    internalState.settingsTab = tab;
    closeCommand();
    internalState.settingsOpen = true;
  }

  const SETTINGS_ITEMS: SettingsConfigItem[] = [
    {
      type: "tab",
      value: "packs",
      icon: PackageOpen,
      keywords: ["packs", "change", "settings"],
      label: "Change Packs",
      tab: SettingsTab.Packs
    },
    {
      type: "tab",
      value: "themes",
      icon: PaintBucket,
      keywords: ["themes", "change", "settings"],
      label: "Change Theme",
      tab: SettingsTab.Themes
    },
    {
      type: "tab",
      value: "section-order",
      icon: ListOrdered,
      keywords: ["order", "change", "section", "settings"],
      label: "Change Section Order",
      tab: SettingsTab.Order
    },
    {
      type: "tab",
      value: "keybind",
      icon: Keyboard,
      keywords: ["keybind", "misc", "change", "command", "settings"],
      label: "Change Command Keybind",
      tab: SettingsTab.Misc
    },
    {
      type: "toggle",
      value: "performance-mode",
      icon: Fan,
      preferenceKey: "performanceMode",
      label: "Toggle Performance Mode",
      keywords: ["performance", "mode", "toggle", "settings"],
      iconProps: {
        "data-performance": () => preferences.performanceMode,
        class: "size-4 will-change-transform data-[performance=false]:animate-spin-slow data-[performance=true]:animate-spin"
      }
    },
    {
      type: "toggle",
      value: "glint",
      icon: Sparkle,
      preferenceKey: "showGlint",
      label: "Toggle Glint",
      keywords: ["glint", "toggle", "settings"]
    },
    {
      type: "toggle",
      value: "mctooltip",
      icon: Pickaxe,
      preferenceKey: "mctooltip",
      label: "Toggle Minecraft-style Tooltips",
      keywords: ["mctooltip", "minecraft", "tooltip", "toggle", "settings"]
    }
  ];
</script>

<Command.Group heading="Settings">
  {#each SETTINGS_ITEMS as item (item.value)}
    <Command.Item
      value={item.value}
      keywords={item.keywords}
      disabled={item.type === "toggle" && item.preferenceKey === "performanceMode" && preferences.performanceModeForced}
      onSelect={() => {
        if (item.type === "tab") {
          handleSettingTab(item.tab);
        } else {
          preferences[item.preferenceKey] = !preferences[item.preferenceKey];
          closeCommand();
        }
      }}>
      <div class="rounded-xl bg-primary/80 p-1">
        {#if item.type === "toggle" && item.iconProps}
          {const Icon = item.icon}
          {const props = Object.fromEntries(Object.entries(item.iconProps).map(([key, value]) => [key, typeof value === "function" ? (value as () => unknown)() : value]))}
          <Icon {...props} />
        {:else}
          <item.icon class="size-4" />
        {/if}
      </div>
      {item.type === "toggle" && item.preferenceKey === "performanceMode" && preferences.performanceModeForced ? "Performance Mode Locked" : item.label}
    </Command.Item>
  {/each}
</Command.Group>
