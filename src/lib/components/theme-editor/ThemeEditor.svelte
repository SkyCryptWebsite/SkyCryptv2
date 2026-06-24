<script lang="ts">
  import { getInternalState, getThemeContext } from "$ctx";
  import { readComputedThemeCssVars } from "$lib/shared/themes/computed-css-vars";
  import { DEFAULT_THEME } from "$lib/shared/themes/defaults";
  import { mergeThemeWithDefaults, ThemeEngine } from "$lib/shared/themes/engine";
  import { partialThemeV4Schema, themeV4Schema, type ThemeV4 } from "$lib/shared/themes/schema";
  import { flyAndScale } from "$lib/shared/utils";
  import { Switch } from "$ui/switch";
  import * as Tabs from "$ui/tabs";
  import { Textarea } from "$ui/textarea";
  import Check from "@lucide/svelte/icons/check";
  import ChevronsDown from "@lucide/svelte/icons/chevrons-down";
  import ChevronsUp from "@lucide/svelte/icons/chevrons-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import { Select } from "bits-ui";
  import * as devalue from "devalue";
  import { mode, setMode, setTheme, theme as activeModeWatcherTheme } from "mode-watcher";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import BackgroundSection from "./BackgroundSection.svelte";
  import ColorSection from "./ColorSection.svelte";
  import MCColorSection from "./MCColorSection.svelte";
  import ThemeActions from "./ThemeActions.svelte";

  const internalState = getInternalState();
  const themeContext = getThemeContext();
  const initialThemeId = activeModeWatcherTheme.current || "default";
  const initialMode = mode.current ?? "dark";
  let restoreThemeId = initialThemeId;
  let restoreMode = initialMode;

  function cloneTheme(theme: ThemeV4): ThemeV4 {
    return devalue.parse(devalue.stringify(theme));
  }

  function ensureEditorDefaults(theme: ThemeV4): ThemeV4 {
    return {
      ...theme,
      mode: mode.current ?? theme.mode,
      cssVars: { ...readComputedThemeCssVars(), ...theme.cssVars },
      extras: {
        minecraft: {
          palette: theme.extras?.minecraft?.palette ?? DEFAULT_THEME.extras?.minecraft?.palette ?? "nice-light",
          overrides: theme.extras?.minecraft?.overrides ?? DEFAULT_THEME.extras?.minecraft?.overrides
        },
        pageBackground: theme.extras?.pageBackground ?? DEFAULT_THEME.extras?.pageBackground,
        enchantedGlint: theme.extras?.enchantedGlint ?? DEFAULT_THEME.extras?.enchantedGlint
      }
    };
  }

  function getInitialTheme(): ThemeV4 {
    if (internalState.themeEditorId) {
      const existing = themeContext.allThemes.find((theme) => theme.metadata.id === internalState.themeEditorId);
      if (existing) {
        if (!themeContext.isFirstParty(existing.metadata.id)) {
          setMode(existing.mode);
        }
        return ensureEditorDefaults(cloneTheme(existing));
      }
    }

    return ensureEditorDefaults(cloneTheme(themeContext.activeTheme ?? DEFAULT_THEME));
  }

  let workingTheme = $state<ThemeV4>(getInitialTheme());
  let jsonString = $state(untrack(() => JSON.stringify(workingTheme, null, 2)));
  let jsonError = $state<string | null>(null);

  function getInitialThemeSource(): ThemeV4 {
    return themeContext.allThemes.find((theme) => theme.metadata.id === initialThemeId) ?? DEFAULT_THEME;
  }

  function restoreInitialTheme() {
    ThemeEngine.clearPreview();
    setTheme(restoreThemeId);
    setMode(restoreMode);
  }

  function handleReset() {
    const initialTheme = getInitialThemeSource();
    if (!themeContext.isFirstParty(initialTheme.metadata.id)) {
      setMode(initialTheme.mode);
    } else {
      setMode(initialMode);
    }
    workingTheme = ensureEditorDefaults(cloneTheme(initialTheme));
  }

  function handleSave() {
    const themeToSave = cloneTheme(workingTheme);
    if (themeContext.isFirstParty(themeToSave.metadata.id)) {
      themeToSave.metadata.id = `custom-${Date.now()}`;
    }

    const result = themeV4Schema.safeParse(themeToSave);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Theme is invalid.");
      return;
    }

    themeContext.saveTheme(result.data);
    themeContext.activeThemeId = result.data.metadata.id;
    restoreThemeId = result.data.metadata.id;
    restoreMode = mode.current ?? result.data.mode;
    workingTheme = ensureEditorDefaults(cloneTheme(result.data));
    toast.success("Theme saved!");
  }

  function handleJsonChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    jsonString = target.value;

    try {
      const parsed = JSON.parse(jsonString);
      const full = themeV4Schema.safeParse(parsed);
      if (full.success) {
        workingTheme = ensureEditorDefaults(full.data);
        jsonError = null;
        return;
      }

      const partial = partialThemeV4Schema.safeParse(parsed);
      if (partial.success && partial.data.schema === 4) {
        workingTheme = ensureEditorDefaults(mergeThemeWithDefaults({ ...partial.data, metadata: { ...workingTheme.metadata, ...partial.data.metadata } }));
        jsonError = null;
        return;
      }

      jsonError = partial.success ? "Theme JSON must use schema version 4." : partial.error.issues[0]?.message;
    } catch (err) {
      jsonError = (err as Error).message;
    }
  }

  function onTabChange(value: string) {
    if (value === "code") {
      jsonString = JSON.stringify(workingTheme, null, 2);
    }
  }

  function handleFork(themeId: string) {
    const base = themeContext.allThemes.find((theme) => theme.metadata.id === themeId);
    if (!base) return;

    if (!themeContext.isFirstParty(base.metadata.id)) {
      setMode(base.mode);
    }
    workingTheme = ensureEditorDefaults(cloneTheme(base));
    workingTheme.metadata.id = `custom-${Date.now()}`;
    workingTheme.metadata.name = `${base.metadata.name} (Copy)`;
    workingTheme.metadata.author = "You";
  }

  function handleNameChange(name: string) {
    workingTheme.metadata.name = name;
  }

  function handleAuthorChange(author: string) {
    workingTheme.metadata.author = author;
  }

  function setLightMode(checked: boolean) {
    const nextMode = checked ? "light" : "dark";
    workingTheme.mode = nextMode;
    setMode(nextMode);
  }

  $effect(() => {
    const result = themeV4Schema.safeParse(workingTheme);
    if (result.success) {
      ThemeEngine.previewTheme(result.data);
    }
  });

  $effect(() => {
    if (!internalState.themeEditorOpen) {
      restoreInitialTheme();
    }
  });

  $effect(() => {
    return () => {
      restoreInitialTheme();
    };
  });
</script>

<div class="flex h-full w-full flex-col">
  <ThemeActions {workingTheme} onReset={handleReset} onSave={handleSave} {handleNameChange} {handleAuthorChange} />

  <div class="flex-1 overflow-y-auto">
    <div class="p-4">
      <div class="mb-4 flex flex-col gap-2">
        <label for="fork-select" class="text-xs font-bold text-muted-foreground uppercase">Start From</label>

        <Select.Root type="single" onValueChange={(value) => handleFork(value)}>
          <Select.Trigger id="fork-select" class="flex items-center justify-between rounded-lg bg-muted p-2 text-left">
            <span>{workingTheme.metadata.name || "Select a theme..."}</span>
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
                        {#each themeContext.allThemes as theme (theme.metadata.id)}
                          <Select.Item class="flex h-10 w-full items-center rounded-lg py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none data-disabled:opacity-50 data-highlighted:bg-muted" label={theme.metadata.name} value={theme.metadata.id}>
                            {#snippet children({ selected })}
                              {theme.metadata.name}

                              {#if selected}
                                <div class="ml-auto">
                                  <Check aria-label="check" />
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

      <Tabs.Root value="visual" onValueChange={onTabChange} class="w-full">
        <Tabs.List class="grid w-full grid-cols-2">
          <Tabs.Trigger value="visual">Visual</Tabs.Trigger>
          <Tabs.Trigger value="code">Code (JSON)</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="visual" class="mt-4 flex flex-col gap-4">
          <div class="flex items-center justify-between rounded-lg bg-muted p-4">
            <div class="flex items-center gap-3">
              {#if mode.current === "light"}
                <Sun class="size-5" />
              {:else}
                <Moon class="size-5" />
              {/if}
              <div class="flex flex-col">
                <span class="text-sm font-bold text-foreground">{mode.current === "light" ? "Light Mode" : "Dark Mode"}</span>
                <span class="text-xs text-muted-foreground">Toggle between light and dark base mode</span>
              </div>
            </div>
            <Switch checked={mode.current === "light"} onCheckedChange={setLightMode} />
          </div>

          <ColorSection bind:workingTheme />
          <BackgroundSection bind:workingTheme />
          <MCColorSection bind:workingTheme />
        </Tabs.Content>

        <Tabs.Content value="code" class="mt-4 flex flex-col gap-2">
          <Textarea value={jsonString} oninput={handleJsonChange} class="h-125 font-mono text-xs" spellcheck="false" />
          {#if jsonError}
            <div class="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              Error: {jsonError}
            </div>
          {/if}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  </div>
</div>
