<script lang="ts">
  import { Input } from "$ui/input";
  import { Label } from "$ui/label";
  import { hexToOklch, oklchToHex } from "$lib/shared/themes/color-utils";
  import { readComputedThemeCssVars } from "$lib/shared/themes/computed-css-vars";
  import type { ShadcnThemeVarKey, ThemeV4 } from "$lib/shared/themes/schema";

  let { workingTheme = $bindable() } = $props<{
    workingTheme: ThemeV4;
  }>();

  const GROUPS: { name: string; keys: ShadcnThemeVarKey[] }[] = [
    {
      name: "Foundation",
      keys: ["background", "foreground", "border", "input", "ring"]
    },
    {
      name: "Surfaces",
      keys: ["card", "cardForeground", "popover", "popoverForeground", "muted", "mutedForeground"]
    },
    {
      name: "Actions",
      keys: ["primary", "primaryForeground", "secondary", "secondaryForeground", "accent", "accentForeground", "accent2", "accent3", "accent4", "destructive"]
    },
    {
      name: "Charts",
      keys: ["chart1", "chart2", "chart3", "chart4", "chart5"]
    },
    {
      name: "Sidebar",
      keys: ["sidebar", "sidebarForeground", "sidebarPrimary", "sidebarPrimaryForeground", "sidebarAccent", "sidebarAccentForeground", "sidebarBorder", "sidebarRing"]
    }
  ];

  function formatKey(key: string) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
  }

  function getColorValue(key: ShadcnThemeVarKey): string {
    return workingTheme.cssVars[key] ?? readComputedThemeCssVars()[key] ?? "oklch(0.5 0 0)";
  }

  function setColorValue(key: ShadcnThemeVarKey, hex: string) {
    workingTheme.cssVars[key] = hexToOklch(hex);
  }
</script>

<div class="flex flex-col gap-6 p-4">
  {#each GROUPS as group (group.name)}
    <div class="flex flex-col gap-3">
      <h3 class="text-sm font-bold tracking-wider text-muted-foreground uppercase">{group.name}</h3>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {#each group.keys as key (key)}
          <div class="flex flex-col gap-1.5">
            <Label for="color-{key}" class="text-xs font-semibold text-foreground/80">{formatKey(key)}</Label>
            <input
              id="color-{key}"
              type="color"
              value={oklchToHex(getColorValue(key))}
              oninput={(e) => {
                setColorValue(key, e.currentTarget.value);
              }}
              class="h-8 w-full cursor-pointer rounded-md border border-border bg-muted transition-colors focus:border-ring focus:outline-none" />
          </div>
        {/each}
      </div>
    </div>
  {/each}

  <div class="flex flex-col gap-3">
    <h3 class="text-sm font-bold tracking-wider text-muted-foreground uppercase">Radius</h3>
    <div class="flex flex-col gap-1.5">
      <Label for="theme-radius" class="text-xs font-semibold text-foreground/80">Radius</Label>
      <Input id="theme-radius" value={workingTheme.cssVars.radius ?? readComputedThemeCssVars().radius ?? "0.625rem"} oninput={(e) => (workingTheme.cssVars.radius = e.currentTarget.value)} />
    </div>
  </div>
</div>
