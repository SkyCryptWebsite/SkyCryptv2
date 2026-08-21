<script lang="ts">
  import { hexToOklch, oklchToHex } from "$lib/shared/themes/color-utils";
  import { MC_PALETTES, paletteNames } from "$lib/shared/themes/presets";
  import type { SkyCryptThemeExtras, ThemeModeName, ThemeV5 } from "$lib/shared/themes/schema";
  import { Input } from "$ui/input";
  import { Label } from "$ui/label";
  import * as Select from "$ui/select";

  let { workingTheme = $bindable(), editingMode } = $props<{
    workingTheme: ThemeV5;
    editingMode: ThemeModeName;
  }>();

  type McCode = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f";
  type McPalette = (typeof paletteNames)[number];
  type MinecraftExtras = NonNullable<SkyCryptThemeExtras["minecraft"]>;

  const mcCodes: McCode[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

  function ensureMinecraft() {
    workingTheme.modes[editingMode].extras ??= {};
    workingTheme.modes[editingMode].extras!.minecraft ??= {
      palette: "nice-light"
    };
  }

  let minecraft: MinecraftExtras = $derived(
    workingTheme.modes[editingMode].extras?.minecraft ?? { palette: "nice-light" }
  );

  function getEffectiveColor(code: McCode) {
    if (minecraft.overrides?.[code]) return minecraft.overrides[code];

    const paletteColors = MC_PALETTES[minecraft.palette as McPalette];
    return paletteColors[`§${code}` as keyof typeof paletteColors];
  }

  function setPalette(value: string) {
    ensureMinecraft();
    workingTheme.modes[editingMode].extras!.minecraft!.palette = value as McPalette;
  }

  function setOverride(code: McCode, color: string) {
    ensureMinecraft();
    workingTheme.modes[editingMode].extras!.minecraft!.overrides ??= {};
    workingTheme.modes[editingMode].extras!.minecraft!.overrides[code] = color;
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <Label for="mc-palette" class="text-sm font-bold tracking-wider text-muted-foreground uppercase"
      >Palette Preset</Label>

    <Select.Root type="single" value={minecraft.palette} onValueChange={setPalette}>
      <Select.Trigger id="mc-palette" class="w-full">
        <span>{minecraft.palette || "Select a palette..."}</span>
      </Select.Trigger>
      <Select.Content>
        {#each paletteNames as name (name)}
          <Select.Item label={name} value={name}>
            {name}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>

  <div class="grid grid-cols-4 gap-3 sm:grid-cols-8">
    {#each mcCodes as code (code)}
      {@const effectiveColor = getEffectiveColor(code)}
      <div class="flex flex-col gap-1.5">
        <Label for="mc-{code}" class="text-xs font-bold text-foreground/80">§{code}</Label>
        <Input
          id="mc-{code}"
          type="color"
          value={oklchToHex(effectiveColor)}
          oninput={(e) => setOverride(code, hexToOklch(e.currentTarget.value))}
          class="p-0" />
      </div>
    {/each}
  </div>
</div>
