<script lang="ts">
  import { getInternalState, getThemeContext } from "$ctx";
  import { readComputedThemeCssVars } from "$lib/shared/themes/computed-css-vars";
  import { DEFAULT_THEME } from "$lib/shared/themes/defaults";
  import { mergeThemeWithDefaults, PREVIEW_THEME_ID, ThemeEngine } from "$lib/shared/themes/engine";
  import { partialThemeV4Schema, themeV4Schema, type ThemeV4 } from "$lib/shared/themes/schema";
  import * as Item from "$ui/item";
  import { Label } from "$ui/label";
  import * as Select from "$ui/select";
  import { Separator } from "$ui/separator";
  import { Switch } from "$ui/switch";
  import * as Tabs from "$ui/tabs";
  import { Textarea } from "$ui/textarea";
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import * as devalue from "devalue";
  import { theme as activeModeWatcherTheme, mode, setMode, setTheme } from "mode-watcher";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import BackgroundSection from "./BackgroundSection.svelte";
  import ColorSection from "./ColorSection.svelte";
  import MCColorSection from "./MCColorSection.svelte";
  import ThemeActions from "./ThemeActions.svelte";

  const internalState = getInternalState();
  const themeContext = getThemeContext();
  const initialThemeId = resolveRestorableThemeId(activeModeWatcherTheme.current || "default");
  const initialMode = mode.current ?? "dark";
  let restoreThemeId = initialThemeId;
  let restoreMode = initialMode;
  let previewActive = false;

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

  function resolveRestorableThemeId(id: string): string {
    if (id === PREVIEW_THEME_ID) return "default";
    return themeContext.allThemes.some((theme) => theme.metadata.id === id) ? id : "default";
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
    if (!internalState.themeEditorOpen) return;

    const result = themeV4Schema.safeParse(workingTheme);
    if (result.success) {
      untrack(() => {
        ThemeEngine.previewTheme(result.data);
      });
    }
  });

  $effect(() => {
    const isOpen = internalState.themeEditorOpen;
    untrack(() => {
      if (isOpen) {
        if (!previewActive) {
          const initialTheme = getInitialTheme();
          workingTheme = initialTheme;
          jsonString = JSON.stringify(initialTheme, null, 2);
          jsonError = null;
          previewActive = true;
          ThemeEngine.activatePreviewTheme();
        }
        return;
      }

      if (previewActive) {
        previewActive = false;
        restoreInitialTheme();
      }
    });
  });

  $effect(() => {
    return () => {
      untrack(() => {
        if (previewActive) {
          previewActive = false;
          restoreInitialTheme();
        }
      });
    };
  });
</script>

<div class="flex h-full w-full flex-col">
  <ThemeActions {workingTheme} onReset={handleReset} onSave={handleSave} {handleNameChange} {handleAuthorChange} />

  <div class="flex-1 mt-4 space-y-4">
    <Separator />
    <div class="flex flex-col gap-2">
      <Label for="fork-select">Start From</Label>

      <Select.Root type="single" onValueChange={(value) => handleFork(value)}>
        <Select.Trigger id="fork-select" class="w-full">
          <span>{workingTheme.metadata.name || "Select a theme..."}</span>
        </Select.Trigger>
        <Select.Content>
          {#each themeContext.allThemes as theme (theme.metadata.id)}
            <Select.Item label={theme.metadata.name} value={theme.metadata.id}></Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    <Tabs.Root value="visual" onValueChange={onTabChange} class="w-full">
      <Tabs.List class="w-full bg-transparent border">
        <Tabs.Trigger value="visual">Visual</Tabs.Trigger>
        <Tabs.Trigger value="code">Code (JSON)</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="visual" class="flex flex-col gap-4">
        <Item.Root variant="outline">
          <Item.Media variant="icon">
            {#if mode.current === "light"}
              <Sun />
            {:else}
              <Moon />
            {/if}
          </Item.Media>
          <Item.Content>
            <Item.Title>{mode.current === "light" ? "Light Mode" : "Dark Mode"}</Item.Title>
            <Item.Description>Toggle between light and dark base mode</Item.Description>
          </Item.Content>
          <Item.Actions>
            <Switch checked={mode.current === "light"} onCheckedChange={setLightMode} />
          </Item.Actions>
        </Item.Root>

        <ColorSection bind:workingTheme />
        <Separator />
        <BackgroundSection bind:workingTheme />
        <Separator />
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
