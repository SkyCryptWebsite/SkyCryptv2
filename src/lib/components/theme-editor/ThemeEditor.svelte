<script lang="ts">
  import { getInternalState, getThemeContext } from "$ctx";
  import { DEFAULT_THEME } from "$lib/shared/themes/defaults";
  import { mergeThemeWithDefaults, PREVIEW_THEME_ID, ThemeEngine } from "$lib/shared/themes/engine";
  import { partialThemeV5Schema, themeV5Schema, type ThemeModeName, type ThemeV5 } from "$lib/shared/themes/schema";
  import { Button } from "$ui/button";
  import * as Item from "$ui/item";
  import { Label } from "$ui/label";
  import * as Select from "$ui/select";
  import { Separator } from "$ui/separator";
  import * as Tabs from "$ui/tabs";
  import { Textarea } from "$ui/textarea";
  import ArrowLeftRight from "@lucide/svelte/icons/arrow-left-right";
  import Moon from "@lucide/svelte/icons/moon";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
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

  function cloneTheme(theme: ThemeV5): ThemeV5 {
    return devalue.parse(devalue.stringify(theme));
  }

  function ensureEditorDefaults(theme: ThemeV5): ThemeV5 {
    return {
      ...theme,
      schema: 5,
      modes: {
        dark: {
          cssVars: theme.modes.dark.cssVars ?? {},
          extras: theme.modes.dark.extras
        },
        light: {
          cssVars: theme.modes.light.cssVars ?? {},
          extras: theme.modes.light.extras
        }
      }
    };
  }

  function resolveRestorableThemeId(id: string): string {
    if (id === PREVIEW_THEME_ID) return "default";
    return themeContext.allThemes.some((theme) => theme.metadata.id === id) ? id : "default";
  }

  function getInitialTheme(): ThemeV5 {
    if (internalState.themeEditorId) {
      const existing = themeContext.allThemes.find((theme) => theme.metadata.id === internalState.themeEditorId);
      if (existing) {
        return ensureEditorDefaults(cloneTheme(existing));
      }
    }

    return ensureEditorDefaults(cloneTheme(themeContext.activeTheme ?? DEFAULT_THEME));
  }

  const initialEditorTheme = getInitialTheme();
  let sourceTheme = $state<ThemeV5>(initialEditorTheme);
  let workingTheme = $state<ThemeV5>(cloneTheme(initialEditorTheme));
  let editingMode = $state<ThemeModeName>((mode.current ?? "dark") === "light" ? "light" : "dark");
  let jsonString = $state(untrack(() => JSON.stringify(workingTheme, null, 2)));
  let jsonError = $state<string | null>(null);

  function restoreInitialTheme() {
    ThemeEngine.clearPreview();
    setTheme(restoreThemeId);
    setMode(restoreMode);
  }

  function handleReset() {
    workingTheme = ensureEditorDefaults(cloneTheme(sourceTheme));
  }

  function handleSave() {
    const themeToSave = cloneTheme(workingTheme);
    if (themeContext.isFirstParty(themeToSave.metadata.id)) {
      themeToSave.metadata.id = `custom-${Date.now()}`;
    }

    const result = themeV5Schema.safeParse(themeToSave);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Theme is invalid.");
      return;
    }

    themeContext.saveTheme(result.data);
    themeContext.activeThemeId = result.data.metadata.id;
    restoreThemeId = result.data.metadata.id;
    restoreMode = mode.current ?? editingMode;
    sourceTheme = ensureEditorDefaults(cloneTheme(result.data));
    workingTheme = ensureEditorDefaults(cloneTheme(result.data));
    toast.success("Theme saved!");
  }

  function handleJsonChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    jsonString = target.value;

    try {
      const parsed = JSON.parse(jsonString);
      const full = themeV5Schema.safeParse(parsed);
      if (full.success) {
        workingTheme = ensureEditorDefaults(full.data);
        jsonError = null;
        return;
      }

      const partial = partialThemeV5Schema.safeParse(parsed);
      if (partial.success && (partial.data.schema === 5 || partial.data.schema === undefined)) {
        workingTheme = ensureEditorDefaults(mergeThemeWithDefaults({ ...partial.data, metadata: { ...workingTheme.metadata, ...partial.data.metadata } }));
        jsonError = null;
        return;
      }

      jsonError = partial.success ? "Theme JSON must use schema version 5." : partial.error.issues[0]?.message;
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

    sourceTheme = ensureEditorDefaults(cloneTheme(base));
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

  function setEditingMode(nextMode: ThemeModeName) {
    editingMode = nextMode;
    setMode(nextMode);
  }

  function copyModeTo(targetMode: ThemeModeName) {
    const sourceMode: ThemeModeName = targetMode === "dark" ? "light" : "dark";
    workingTheme.modes[targetMode] = devalue.parse(devalue.stringify(workingTheme.modes[sourceMode]));
    toast.success(`${sourceMode === "dark" ? "Dark" : "Light"} mode copied.`);
  }

  function resetCurrentMode() {
    workingTheme.modes[editingMode] = cloneTheme(sourceTheme).modes[editingMode];
    toast.success(`${editingMode === "dark" ? "Dark" : "Light"} mode reset.`);
  }

  $effect(() => {
    if (!internalState.themeEditorOpen) return;

    const result = themeV5Schema.safeParse(workingTheme);
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
          sourceTheme = initialTheme;
          workingTheme = cloneTheme(initialTheme);
          jsonString = JSON.stringify(initialTheme, null, 2);
          jsonError = null;
          editingMode = (mode.current ?? initialMode) === "light" ? "light" : "dark";
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
            {#if editingMode === "light"}
              <Sun />
            {:else}
              <Moon />
            {/if}
          </Item.Media>
          <Item.Content>
            <Item.Title>{editingMode === "light" ? "Editing Light Mode" : "Editing Dark Mode"}</Item.Title>
            <Item.Description>Switch branches without changing the selected theme</Item.Description>
          </Item.Content>
          <Item.Actions>
            <div class="flex items-center gap-1">
              <Button type="button" size="sm" variant={editingMode === "dark" ? "default" : "outline"} onclick={() => setEditingMode("dark")}>
                <Moon class="size-4" />
                Dark
              </Button>
              <Button type="button" size="sm" variant={editingMode === "light" ? "default" : "outline"} onclick={() => setEditingMode("light")}>
                <Sun class="size-4" />
                Light
              </Button>
            </div>
          </Item.Actions>
        </Item.Root>

        <div class="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onclick={() => copyModeTo(editingMode === "dark" ? "light" : "dark")}>
            <ArrowLeftRight class="size-4" />
            Copy {editingMode === "dark" ? "dark to light" : "light to dark"}
          </Button>
          <Button type="button" variant="outline" size="sm" onclick={resetCurrentMode}>
            <RotateCcw class="size-4" />
            Reset {editingMode}
          </Button>
        </div>

        <ColorSection bind:workingTheme {editingMode} />
        <Separator />
        <BackgroundSection bind:workingTheme {editingMode} />
        <Separator />
        <MCColorSection bind:workingTheme {editingMode} />
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
