<script lang="ts">
  import { hexToOklch, oklchToHex } from "$lib/shared/themes/color-utils";
  import { DEFAULT_THEME } from "$lib/shared/themes/defaults";
  import { MC_PALETTES, paletteNames } from "$lib/shared/themes/presets";
  import type { SkyCryptThemeExtras, ThemeV4 } from "$lib/shared/themes/schema";
  import { flyAndScale } from "$lib/shared/utils";
  import { Label } from "$ui/label";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronsDown from "@lucide/svelte/icons/chevrons-down";
  import ChevronsUp from "@lucide/svelte/icons/chevrons-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import { Select } from "bits-ui";

  let { workingTheme = $bindable() } = $props<{
    workingTheme: ThemeV4;
  }>();

  type McCode = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f";
  type McPalette = (typeof paletteNames)[number];
  type MinecraftExtras = NonNullable<SkyCryptThemeExtras["minecraft"]>;

  const mcCodes: McCode[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

  function ensureMinecraft() {
    workingTheme.extras ??= {};
    workingTheme.extras.minecraft ??= {
      palette: DEFAULT_THEME.extras?.minecraft?.palette ?? "nice-light"
    };
  }

  let minecraft: MinecraftExtras = $derived(workingTheme.extras?.minecraft ?? DEFAULT_THEME.extras?.minecraft ?? { palette: "nice-light" });

  function getEffectiveColor(code: McCode) {
    if (minecraft.overrides?.[code]) return minecraft.overrides[code];

    const paletteColors = MC_PALETTES[minecraft.palette as McPalette];
    return paletteColors[`§${code}` as keyof typeof paletteColors];
  }

  function setPalette(value: string) {
    ensureMinecraft();
    workingTheme.extras.minecraft.palette = value as McPalette;
  }

  function setOverride(code: McCode, color: string) {
    ensureMinecraft();
    workingTheme.extras.minecraft.overrides ??= {};
    workingTheme.extras.minecraft.overrides[code] = color;
  }
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col gap-2">
    <Label for="mc-palette" class="text-sm font-bold tracking-wider text-muted-foreground uppercase">Palette Preset</Label>

    <Select.Root type="single" value={minecraft.palette} onValueChange={setPalette}>
      <Select.Trigger id="mc-palette" class="flex items-center justify-between rounded-lg bg-muted p-2 text-left">
        <span>{minecraft.palette || "Select a palette..."}</span>
        <ChevronsUpDown class="size-4 text-muted-foreground" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content forceMount class="focus-override z-50 max-h-(--bits-select-content-available-height) w-(--bits-select-anchor-width) min-w-(--bits-select-anchor-width) rounded-lg bg-popover px-1 py-3 text-popover-foreground outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1" sideOffset={10}>
          {#snippet child({ open, props, wrapperProps })}
            {#if open}
              <div {...wrapperProps}>
                <div {...props} transition:flyAndScale>
                  <Select.ScrollUpButton class="flex w-full items-center justify-center">
                    <ChevronsUp class="size-3" />
                  </Select.ScrollUpButton>

                  <Select.Viewport class="p-1">
                    {#each paletteNames as name (name)}
                      <Select.Item class="flex h-10 w-full items-center rounded-lg py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none data-disabled:opacity-50 data-highlighted:bg-muted" label={name} value={name}>
                        {#snippet children({ selected })}
                          {name}

                          {#if selected}
                            <div class="ml-auto">
                              <CheckIcon aria-label="check" />
                            </div>
                          {/if}
                        {/snippet}
                      </Select.Item>
                    {/each}
                  </Select.Viewport>
                  <Select.ScrollDownButton class="flex w-full items-center justify-center">
                    <ChevronsDown class="size-3" />
                  </Select.ScrollDownButton>
                </div>
              </div>
            {/if}
          {/snippet}
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  </div>

  <div class="grid grid-cols-4 gap-3 sm:grid-cols-8">
    {#each mcCodes as code (code)}
      {@const effectiveColor = getEffectiveColor(code)}
      <div class="flex flex-col gap-1.5">
        <Label for="mc-{code}" class="text-xs font-bold text-foreground/80">§{code}</Label>

        <input id="mc-{code}" type="color" value={oklchToHex(effectiveColor)} oninput={(e) => setOverride(code, hexToOklch(e.currentTarget.value))} class="h-8 w-full cursor-pointer rounded-md border border-border bg-muted transition-colors focus:border-ring focus:outline-none" />
      </div>
    {/each}
  </div>
</div>
