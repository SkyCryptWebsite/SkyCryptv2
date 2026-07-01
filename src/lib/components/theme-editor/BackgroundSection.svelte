<script lang="ts">
  import type { ThemeV4 } from "$lib/shared/themes/schema";
  import { Input } from "$ui/input";
  import { Label } from "$ui/label";
  import ImageIcon from "@lucide/svelte/icons/image";
  import Sparkles from "@lucide/svelte/icons/sparkles";

  let { workingTheme = $bindable() } = $props<{
    workingTheme: ThemeV4;
  }>();

  function ensureExtras() {
    workingTheme.extras ??= {};
  }

  function setPageBackground(url: string) {
    ensureExtras();
    workingTheme.extras.pageBackground = url ? { url } : undefined;
  }

  function setEnchantedGlint(url: string) {
    ensureExtras();
    workingTheme.extras.enchantedGlint = url || undefined;
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center gap-2">
      <ImageIcon class="size-4 text-muted-foreground" />
      <Label for="page-bg-url" class="text-xs font-semibold text-foreground/80">Image URL</Label>
    </div>
    <p class="text-[10px] text-muted-foreground">Must start with https://</p>
    <Input id="page-bg-url" type="url" value={workingTheme.extras?.pageBackground?.url ?? ""} oninput={(e) => setPageBackground(e.currentTarget.value)} placeholder="https://imgur.com/..." pattern="^https://.*" />
  </div>

  <div class="flex flex-col gap-1.5">
    <div class="flex items-center gap-2">
      <Sparkles class="size-4 text-muted-foreground" />
      <Label for="enchanted-glint-url" class="text-xs font-semibold text-foreground/80">Glint Texture URL</Label>
    </div>
    <p class="text-[10px] text-muted-foreground">Custom enchanted glint texture. Must start with https://. Leave empty for default.</p>
    <Input id="enchanted-glint-url" type="url" value={workingTheme.extras?.enchantedGlint ?? ""} oninput={(e) => setEnchantedGlint(e.currentTarget.value)} placeholder="https://example.com/glint.png" pattern="^https://.*" />
  </div>
</div>
