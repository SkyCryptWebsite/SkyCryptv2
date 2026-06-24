<script lang="ts">
  import { getInternalState, getThemeContext } from "$ctx";
  import { SettingsTab } from "$lib/components/header/types";
  import { getThemeIcons } from "$lib/shared/api/themes.remote";
  import { readDefaultThemeCssVars } from "$lib/shared/themes/computed-css-vars";
  import { FIRST_PARTY_THEMES } from "$lib/shared/themes/first-party";
  import type { ThemeV4 } from "$lib/shared/themes/schema";
  import { getThemeShareURL } from "$lib/shared/themes/sharing";
  import * as AlertDialog from "$ui/alert-dialog";
  import { Button } from "$ui/button";
  import { Label } from "$ui/label";
  import * as Tabs from "$ui/tabs";
  import Check from "@lucide/svelte/icons/check";
  import Edit from "@lucide/svelte/icons/edit-2";
  import Link2 from "@lucide/svelte/icons/link-2";
  import PaintBucket from "@lucide/svelte/icons/paint-bucket";
  import Plus from "@lucide/svelte/icons/plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { Avatar, RadioGroup } from "bits-ui";
  import { mode } from "mode-watcher";
  import { toast } from "svelte-sonner";

  const themeContext = getThemeContext();
  const internalState = getInternalState();

  let deleteDialogOpen = $state(false);
  let themeToDelete = $state<string | null>(null);

  function confirmDelete(themeId: string): void {
    themeToDelete = themeId;
    deleteDialogOpen = true;
  }

  function handleDelete(): void {
    if (themeToDelete) {
      themeContext.deleteTheme(themeToDelete);
      deleteDialogOpen = false;
      themeToDelete = null;
    }
  }

  async function shareTheme(themeId: string): Promise<void> {
    const theme = themeContext.allThemes.find((t) => t.metadata.id === themeId);
    if (!theme) return;

    const url = await getThemeShareURL(theme);
    try {
      await navigator.clipboard.writeText(url);
      // Toast notification
      toast.success("Theme URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }

  function openThemeEditor(themeId?: string): void {
    internalState.themeEditorId = themeId || null;
    internalState.themeEditorOpen = true;
    internalState.settingsOpen = false; // Close settings modal
  }

  function getThemeIconColor(theme: ThemeV4): string {
    const defaultCssVars = readDefaultThemeCssVars();
    return theme.cssVars.sidebarPrimary ?? theme.cssVars.chart2 ?? theme.cssVars.primary ?? defaultCssVars.sidebarPrimary ?? defaultCssVars.chart2 ?? defaultCssVars.primary ?? "oklch(0.627 0.194 149.214)";
  }
</script>

<Tabs.Content value={SettingsTab.Themes} class="space-y-4">
  <div class="flex flex-col items-start">
    <div class="flex items-center-safe gap-1">
      <PaintBucket class="size-6 h-lh shrink-0" />
      <h4 class="text-lg font-semibold">Themes</h4>
    </div>
    <div>
      <div class="space-y-2 text-muted-foreground">
        <p>Themes change the colors of SkyCrypt.</p>
      </div>
    </div>
  </div>

  <RadioGroup.Root class="mt-4 flex max-h-96 flex-col gap-4 overflow-x-clip overflow-y-auto" bind:value={themeContext.current}>
    <h5 class="text-sm font-semibold">Official Themes</h5>
    {#each FIRST_PARTY_THEMES as theme (theme.metadata.id)}
      {#await getThemeIcons({ color: getThemeIconColor(theme), invert: mode.current === "light" }) then iconSvg}
        {const iconDataUrl = `data:image/svg+xml;base64,${btoa(iconSvg)}`}
        <Label for={theme.metadata.id} class="flex items-center justify-between gap-4 rounded-xl border p-2">
          <div class="flex items-center gap-2">
            <Avatar.Root class="shrink-0 select-none">
              <Avatar.Image loading="lazy" src={iconDataUrl} alt={theme.metadata.name} class="pointer-events-none aspect-square size-10 h-full rounded-xl select-none"></Avatar.Image>
              <Avatar.Fallback class="flex items-center rounded-xl text-center font-semibold uppercase">{theme.metadata.name.slice(0, 2)}</Avatar.Fallback>
            </Avatar.Root>
            <div class="flex flex-col">
              <h4 class="font-semibold text-text/90">{theme.metadata.name}</h4>
              <p class="overflow-hidden font-normal text-ellipsis whitespace-nowrap text-text/60">
                by
                <span class="text-text/80">{theme.metadata.author}</span>
              </p>
            </div>
          </div>
          <RadioGroup.Item id={theme.metadata.id} value={theme.metadata.id} class="group inline-flex h-6 min-h-6 w-10 shrink-0 cursor-pointer items-center rounded-full px-0 transition-colors ease-out">
            <Check class="size-6 text-icon group-data-[state=unchecked]:invisible" />
          </RadioGroup.Item>
        </Label>
      {/await}
    {/each}

    <div class="space-y-2">
      <h5 class="text-sm font-semibold">Custom Themes</h5>

      <Button variant="secondary" class="w-full" onclick={() => openThemeEditor()}>
        <Plus class="size-5" />
        Create a Theme
      </Button>
    </div>

    {#if themeContext.userThemes.length === 0}
      <p class="text-muted-foreground italic">No custom themes yet. Create your own theme or import one from the community!</p>
    {:else}
      {#each themeContext.userThemes as theme (theme.metadata.id)}
        {#await getThemeIcons({ color: getThemeIconColor(theme), invert: mode.current === "light" }) then iconSvg}
          {const iconDataUrl = `data:image/svg+xml;base64,${btoa(iconSvg)}`}
          <Label for={theme.metadata.id} class="flex items-center justify-between gap-2 rounded-xl border p-2">
            <div class="flex items-center gap-2">
              <Avatar.Root class="shrink-0 select-none">
                <Avatar.Image loading="lazy" src={iconDataUrl} alt={theme.metadata.name} class="pointer-events-none aspect-square size-10 h-full rounded-xl select-none"></Avatar.Image>
                <Avatar.Fallback class="flex items-center rounded-xl text-center font-semibold uppercase">{theme.metadata.name.slice(0, 2)}</Avatar.Fallback>
              </Avatar.Root>
              <div class="flex flex-col">
                <h4 class="font-semibold">{theme.metadata.name}</h4>
                <p class="overflow-hidden font-normal text-ellipsis whitespace-nowrap text-muted-foreground">
                  by
                  {theme.metadata.author}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <RadioGroup.Item id={theme.metadata.id} value={theme.metadata.id} class="group inline-flex h-6 min-h-6 w-10 shrink-0 cursor-pointer items-center rounded-full px-0 transition-colors ease-out">
                <Check class="size-6 text-icon group-data-[state=unchecked]:invisible" />
              </RadioGroup.Item>

              <Button title="Edit theme" variant="secondary" onclick={() => openThemeEditor(theme.metadata.id)} aria-label="Edit theme">
                <Edit class="size-4" />
              </Button>

              <Button title="Share theme" variant="secondary" onclick={() => shareTheme(theme.metadata.id)} aria-label="Share theme">
                <Link2 class="size-4" />
              </Button>

              <Button title="Delete theme" variant="destructive" onclick={() => confirmDelete(theme.metadata.id)} aria-label="Delete theme">
                <Trash2 class="size-4" />
              </Button>
            </div>
          </Label>
        {/await}
      {/each}
    {/if}
  </RadioGroup.Root>
</Tabs.Content>

<AlertDialog.Root bind:open={deleteDialogOpen}>
  <AlertDialog.Content class="glass standard:glass *:data-[slot='dialog-close']:hidden glass-bg-popover">
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Theme?</AlertDialog.Title>
      <AlertDialog.Description>This action cannot be undone. The theme will be permanently removed from your library.</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Action variant="destructive" onclick={handleDelete}>Delete</AlertDialog.Action>
      <AlertDialog.Cancel variant="outline">Cancel</AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
