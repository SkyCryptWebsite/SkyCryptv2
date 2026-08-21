<script lang="ts">
  import { getHoverContext, getInternalState } from "$ctx";
  import Misc from "$lib/components/header/settings/Misc.svelte";
  import Order from "$lib/components/header/settings/Order.svelte";
  import Packs from "$lib/components/header/settings/Packs.svelte";
  import Themes from "$lib/components/header/settings/Themes.svelte";
  import { SettingsTab } from "$lib/components/header/types";
  import { Button } from "$ui/button";
  import * as Dialog from "$ui/dialog";
  import * as Drawer from "$ui/drawer";
  import * as Tabs from "$ui/tabs";
  import { type Icon as IconType } from "@lucide/svelte";
  import Cog from "@lucide/svelte/icons/cog";
  import ListOrdered from "@lucide/svelte/icons/list-ordered";
  import PackageOpen from "@lucide/svelte/icons/package-open";
  import PaintBucket from "@lucide/svelte/icons/paint-bucket";
  import Settings from "@lucide/svelte/icons/settings";
  import { cubicOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";

  type SettingsProps = Record<string, unknown>;
  type TabsListType = {
    value: SettingsTab;
    icon: typeof IconType;
  };

  const isHover = getHoverContext();
  const internalState = getInternalState();

  const tabsList = [
    {
      value: SettingsTab.Packs,
      icon: PackageOpen
    },
    {
      value: SettingsTab.Themes,
      icon: PaintBucket
    },
    {
      value: SettingsTab.Order,
      icon: ListOrdered
    },
    {
      value: SettingsTab.Misc,
      icon: Settings
    }
  ] satisfies TabsListType[];

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicOut
  });
</script>

{#snippet settings()}
  <Tabs.Root bind:value={internalState.settingsTab}>
    <Tabs.List class="h-auto! w-full justify-between border bg-transparent">
      {#each tabsList as tab (tab.value)}
        {const isActive = $derived(tab.value === internalState.settingsTab)}
        <Tabs.Trigger value={tab.value} class="h-auto! capitalize data-[state=active]:bg-transparent!">
          {#if isActive}
            <div
              class="absolute inset-0 rounded-full bg-primary/40"
              in:send={{ key: "active-tab" }}
              out:receive={{ key: "active-tab" }}>
            </div>
          {/if}
          <div class="relative z-10 flex items-center-safe justify-center-safe">
            <tab.icon class="size-5" />
            {tab.value}
          </div>
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
    <Packs />
    <Themes />
    <Order />
    <Misc />
  </Tabs.Root>
{/snippet}

{#snippet settingsButton(props: SettingsProps)}
  <Button {...props} variant="outline">
    <p class="hidden md:block">Settings</p>
    <Cog
      class="size-4 transition-all duration-300 ease-out data-[is-open=true]:rotate-45"
      data-is-open={internalState.settingsOpen} />
  </Button>
{/snippet}

{#if isHover.current}
  <Dialog.Root bind:open={internalState.settingsOpen}>
    <Dialog.Trigger>
      {#snippet child({ props })}
        {@render settingsButton(props)}
      {/snippet}
    </Dialog.Trigger>

    <Dialog.Content class="glass glass-bg-popover *:data-[slot='dialog-close']:hidden standard:glass">
      {@render settings()}
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root shouldScaleBackground={true} setBackgroundColorOnScale={false} bind:open={internalState.settingsOpen}>
    <Drawer.Trigger>
      {#snippet child({ props })}
        {@render settingsButton(props)}
      {/snippet}
    </Drawer.Trigger>

    <Drawer.Content
      class="before:glass before:glass-bg-popover standard:dark:before:bg-transparent [&>div:first-child]:mb-4">
      {@render settings()}
    </Drawer.Content>
  </Drawer.Root>
{/if}
