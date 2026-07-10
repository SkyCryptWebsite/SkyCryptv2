<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getHoverContext } from "$ctx";
  import { cardPresets, type CardPreset } from "$lib/components/cards";
  import { getDefaults, settingsToParams } from "$lib/components/cards/default/schema";
  import * as Dialog from "$lib/components/ui/dialog";
  import { cn } from "$lib/shared/utils";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Collapsible from "$ui/collapsible";
  import * as Drawer from "$ui/drawer";
  import * as Item from "$ui/item";
  import { Label } from "$ui/label";
  import { Switch } from "$ui/switch";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ClipboardIcon from "@lucide/svelte/icons/clipboard";
  import CodeXmlIcon from "@lucide/svelte/icons/code-xml";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import IdCardIcon from "@lucide/svelte/icons/id-card";
  import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import type { AvatarImageLoadingStatus } from "bits-ui";
  import { Debounced } from "runed";
  import { toast } from "svelte-sonner";

  type TriggerProps = Record<string, unknown>;
  const isHover = getHoverContext();

  let selectedPreset = $state<CardPreset>(cardPresets[0]);
  // svelte-ignore state_referenced_locally
  let settings = $state<Record<string, boolean | string | number>>(getDefaults(selectedPreset.schema));

  const imageUrl = $derived.by(() => {
    const base =
      page.url.origin +
      resolve("/stats/[ign]/[[profile]]/card", {
        ign: page.params.ign ?? "",
        profile: page.params.profile ?? ""
      });
    const params = settingsToParams(settings, selectedPreset.schema);
    const search = params.toString();
    return search ? `${base}?${search}` : base;
  });

  const debouncedUrl = new Debounced(() => imageUrl, 2000);
  let loadingStatus: AvatarImageLoadingStatus | undefined = $state("loading");
  const isImagePending = $derived(loadingStatus === "loading" || debouncedUrl.pending);

  function selectPreset(presetId: string) {
    const preset = cardPresets.find((p) => p.id === presetId);
    if (preset) {
      selectedPreset = preset;
      settings = getDefaults(preset.schema);
      loadingStatus = "loading";
    }
  }

  function updateSetting(key: string, value: boolean | string | number) {
    settings[key] = value;
    loadingStatus = "loading";
  }

  function resetToDefaults() {
    settings = getDefaults(selectedPreset.schema);
    loadingStatus = "loading";
  }

  async function copyImageUrl() {
    toast.promise(navigator.clipboard.writeText(imageUrl), {
      loading: "Copying image URL...",
      success: "Image URL copied to clipboard!",
      error: "Failed to copy image URL."
    });
  }

  async function copyBBCode() {
    const profileUrl =
      page.url.origin +
      resolve("/stats/[ign]/[[profile]]", {
        ign: page.params.ign ?? "",
        profile: page.params.profile ?? ""
      });
    const cacheBuster = imageUrl.includes("?") ? `&i=${Date.now()}` : `?i=${Date.now()}`;
    const bbCode = `[URL='${profileUrl}'][IMG]${imageUrl}${cacheBuster}[/IMG][/URL]`;

    toast.promise(navigator.clipboard.writeText(bbCode), {
      loading: "Copying BBCode...",
      success: "BBCode copied to clipboard!",
      error: "Failed to copy BBCode."
    });
  }
</script>

{#snippet triggerButton(props: TriggerProps)}
  <Button {...props} class="font-semibold text-base">
    <IdCardIcon class="size-4" />
    Card
  </Button>
{/snippet}

{#snippet presetCards()}
  <Collapsible.Root class="border p-2 rounded-lg" open={true}>
    <Collapsible.Trigger class="group flex w-full cursor-pointer items-center gap-1 py-1">
      <ChevronDown class="size-4 transition-transform duration-200 ease-out group-data-[state=open]:-rotate-180" />
      <Label>Preset</Label>
    </Collapsible.Trigger>
    <Collapsible.Content class="gap-2 pt-1 flex flex-nowrap overflow-auto">
      {#each cardPresets as preset (preset.id)}
        <Button onclick={() => selectPreset(preset.id)} class={cn("h-full fle flex-col gap-1.5 rounded-lg border-2 p-2 transition-all", selectedPreset.id === preset.id ? "border-primary bg-primary/10" : "border-text/10 bg-text/5 hover:border-text/20 hover:bg-text/10")}>
          <div class="flex h-10 w-28 items-stretch gap-1 rounded bg-text/5 p-1">
            <div class="w-1/4 rounded-sm bg-text/15"></div>
            <div class="flex flex-1 flex-col justify-between gap-px">
              <div class="h-1 w-3/4 rounded-full bg-text/20"></div>
              <div class="flex gap-0.5">
                <div class="h-1 flex-1 rounded-full bg-primary/30"></div>
                <div class="h-1 flex-1 rounded-full bg-primary/20"></div>
              </div>
              <div class="h-px w-full bg-text/10"></div>
              <div class="flex gap-px">
                {#each Array(5) as _, i (i)}
                  <div class="h-1 flex-1 rounded-full bg-primary/25"></div>
                {/each}
              </div>
              <div class="flex gap-px">
                {#each Array(2) as _, i (i)}
                  <div class="h-1 flex-1 rounded-full bg-primary/25"></div>
                {/each}
                {#each Array(3) as _, i (i)}
                  <div class="h-1 flex-1 rounded-full bg-primary/15"></div>
                {/each}
              </div>
              <div class="h-px w-full bg-text/10"></div>
              <div class="flex gap-px">
                {#each Array(5) as _, i (i)}
                  <div class="h-1 flex-1 rounded-full bg-primary/20"></div>
                {/each}
              </div>
              <div class="h-0.5 w-full rounded-full bg-text/10"></div>
            </div>
          </div>
          <span class="text-xs font-semibold text-text/70">{preset.name}</span>
        </Button>
      {/each}
    </Collapsible.Content>
  </Collapsible.Root>
{/snippet}

{#snippet optionGroups()}
  {#each selectedPreset.schema as group (group.groupName)}
    <Collapsible.Root class="border p-2 rounded-lg">
      <Collapsible.Trigger class="group flex w-full cursor-pointer items-center gap-1 py-1">
        <ChevronDown class="size-4 transition-transform duration-200 ease-out group-data-[state=open]:-rotate-180" />
        <Label>{group.groupName}</Label>
      </Collapsible.Trigger>
      <Collapsible.Content class="flex flex-col gap-1.5 pt-1.5">
        {#each group.options as option (option.key)}
          {#if option.type === "checkbox"}
            <Label for={option.key}>
              <Item.Root variant="outline">
                <Item.Content>
                  <Item.Title>{option.label}</Item.Title>
                </Item.Content>
                <Item.Actions>
                  <Switch id={option.key} checked={settings[option.key] as boolean} onCheckedChange={(checked) => updateSetting(option.key, checked)}></Switch>
                </Item.Actions>
              </Item.Root>
            </Label>
          {:else if option.type === "color"}
            <Label for={option.key}>
              <Item.Root variant="outline">
                <Item.Content>
                  <Item.Title>{option.label}</Item.Title>
                </Item.Content>
                <Item.Actions>
                  <input type="color" id={option.key} value={settings[option.key] as string} oninput={(e) => updateSetting(option.key, e.currentTarget.value)} class="size-8 cursor-pointer rounded-md border border-text/10 bg-transparent" />
                </Item.Actions>
              </Item.Root>
            </Label>
          {:else if option.type === "text"}
            <Label for={option.key}>
              <Item.Root variant="outline">
                <Item.Content>
                  <Item.Title>{option.label}</Item.Title>
                </Item.Content>
                <Item.Actions>
                  <input type="text" id={option.key} value={settings[option.key] as string} oninput={(e) => updateSetting(option.key, e.currentTarget.value)} class="w-full max-w-40 rounded-md border border-text/10 bg-text/5 px-2 py-1 text-sm text-text focus:border-primary focus:outline-none" />
                </Item.Actions>
              </Item.Root>
            </Label>
          {:else if option.type === "number"}
            <Label for={option.key}>
              <Item.Root variant="outline">
                <Item.Content>
                  <Item.Title>{option.label}</Item.Title>
                </Item.Content>
                <Item.Actions>
                  <input type="number" id={option.key} value={settings[option.key] as number} oninput={(e) => updateSetting(option.key, Number(e.currentTarget.value))} class="w-full max-w-24 rounded-md border border-text/10 bg-text/5 px-2 py-1 text-sm text-text focus:border-primary focus:outline-none" />
                </Item.Actions>
              </Item.Root>
            </Label>
          {/if}
        {/each}
      </Collapsible.Content>
    </Collapsible.Root>
  {/each}
{/snippet}

{#snippet resetButton()}
  <Button variant="destructive" onclick={resetToDefaults}>
    <RotateCcwIcon class="size-3.5" />
    Reset to Defaults
  </Button>
{/snippet}

{#snippet imagePreview()}
  <div class="flex flex-col gap-2 rounded-lg border p-2">
    <div class="flex items-center justify-between">
      <Label>Preview</Label>
      <div class="flex items-center gap-1">
        <Button variant="outline" class="text-xs" onclick={copyImageUrl} title="Copy Image URL">
          <ClipboardIcon class="size-3" />
          URL
        </Button>
        <Button variant="outline" class="text-xs" onclick={copyBBCode} title="Copy BBCode for Forums">
          <CodeXmlIcon class="size-3" />
          BBCode
        </Button>
        <Button variant="outline" class="text-xs" href={resolve("/stats/[ign]/[[profile]]/card", { ign: page.params.ign ?? "", profile: page.params.profile ?? "" })} target="_blank" rel="noopener noreferrer" title="Open Image in New Tab">
          <ExternalLinkIcon class="size-3" />
          Image
        </Button>
      </div>
    </div>
    <Avatar.Root class="relative bg-transparent after:border-none size-full shrink overflow-hidden rounded-lg" bind:loadingStatus>
      {#if isImagePending}
        <div class="absolute inset-0 z-10 flex items-center justify-center">
          <LoaderCircleIcon class="size-8 animate-spin text-text/40" />
        </div>
      {/if}
      <Avatar.Image src={debouncedUrl.current} class="object-contain aspect-auto rounded-none" />
      <Avatar.Fallback class="flex aspect-75/17 rounded-lg w-full items-center justify-center text-sm text-text/40">Card Preview</Avatar.Fallback>
    </Avatar.Root>
  </div>
{/snippet}

{#if isHover.current}
  <Dialog.Root>
    <Dialog.Trigger>
      {#snippet child({ props })}
        {@render triggerButton(props)}
      {/snippet}
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Content class="sm:max-w-2xl bg-transparent glass glass-bg-popover" showCloseButton={false}>
        <Dialog.Header>
          <Dialog.Title>Generate your SkyCrypt card</Dialog.Title>
          <Dialog.Description>Choose from various presets and options to create the perfect card for sharing on social media, forums, or with friends!</Dialog.Description>
        </Dialog.Header>
        <div class="flex flex-col gap-4 overflow-y-auto">
          {@render presetCards()}
          {@render optionGroups()}
          {@render imagePreview()}
          {@render resetButton()}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
{:else}
  <Drawer.Root shouldScaleBackground={true} setBackgroundColorOnScale={false}>
    <Drawer.Trigger>
      {#snippet child({ props })}
        {@render triggerButton(props)}
      {/snippet}
    </Drawer.Trigger>
    <Drawer.Content class="px-6 py-4 before:bg-background/80">
      <div class="flex flex-col gap-4 mt-4">
        {@render presetCards()}
        {@render optionGroups()}
        {@render imagePreview()}
        {@render resetButton()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
