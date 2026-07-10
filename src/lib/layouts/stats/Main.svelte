<script lang="ts">
  import { browser } from "$app/environment";
  import { replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { CombinedContext, getHoverContext, getInternalState, getPreferences, getProfileContext, getRecentSearches, ProfileContext, setCombinedContext, setProfileContext } from "$ctx";
  import { ContainedItemsGrid, ItemContent } from "$lib/components/item";
  import { Navbar } from "$lib/components/misc";
  import Skin3D from "$lib/components/misc/Skin3D.svelte";
  import AdditionalStats from "$lib/layouts/stats/AdditionalStats.svelte";
  import PlayerProfile from "$lib/layouts/stats/PlayerProfile.svelte";
  import Skills from "$lib/layouts/stats/Skills.svelte";
  import Stats from "$lib/layouts/stats/Stats.svelte";
  import Sections from "$lib/sections/Sections.svelte";
  import type { ModelsStatsOutput } from "$lib/shared/api/orval-generated";
  import { getCombined } from "$lib/shared/api/skycrypt-api.remote";
  import * as Dialog from "$ui/dialog";
  import * as Drawer from "$ui/drawer";
  import Image from "@lucide/svelte/icons/image";
  import { Avatar } from "bits-ui";
  import { Pane } from "paneforge";
  import { onDestroy, tick, untrack } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  const { data: ctx }: { data: ModelsStatsOutput } = $props();

  const isHover = getHoverContext();
  const preferences = getPreferences();
  const recentSearches = getRecentSearches();
  const internalState = getInternalState();

  const profile = $derived(ctx);

  let showStaticSkin = $derived(preferences.performanceMode);
  let _rightSize = $state(0);
  let _leftSize = $state(0);
  let _skinCollapsed = $state(false);
  let _leftPane = $state<Pane>(null!);
  let innerWidth = $state(window.innerWidth);
  let _defaultLeftPanel = $derived(Math.ceil((300 / innerWidth) * 100));
  let _defaultRightPanel = $derived(Math.ceil((700 / innerWidth) * 100));

  const abortController = new AbortController();

  // Initialize the profile context
  const profileClass = new ProfileContext();
  const combinedClass = new CombinedContext();
  setProfileContext(profileClass);
  setCombinedContext(combinedClass);
  const combined = $derived(ctx.uuid && ctx.profile_id ? await getCombined({ uuid: ctx.uuid, profileId: ctx.profile_id }) : null);

  function rewriteURL() {
    if (!(ctx as ModelsStatsOutput)) return;

    const { username, profile_cute_name } = ctx;
    if (!username) return;

    const current = page.url.pathname;
    const wanted = `/stats/${username}/${profile_cute_name || ""}`;

    // Update the URL to match the username and cute name
    if (current !== wanted) {
      // Only proceed if not aborted
      if (!abortController.signal.aborted) {
        tick()
          .then(() => {
            if (!abortController.signal.aborted) {
              replaceState(
                resolve("/stats/[ign]/[[profile]]", {
                  ign: username,
                  profile: profile_cute_name || ""
                }),
                page.state
              );
            }
          })
          .catch(() => {});
      }
    }
  }

  $effect.pre(() => {
    if (!ctx) return;

    const { username, uuid } = ctx;
    if (!username || !uuid) return;

    untrack(() => {
      // Find existing search by username/IGN and update with UUID
      const existingIndex = recentSearches.current.findIndex((search) => search.ign.toLowerCase() === username.toLowerCase());

      if (existingIndex !== -1) {
        // Update existing search with UUID and update IGN in case it changed casing
        recentSearches.current[existingIndex] = {
          ...recentSearches.current[existingIndex],
          ign: username,
          uuid: uuid
        };
      }
    });
  });

  // Update the profile context when the data changes
  $effect.pre(() => {
    profileClass.current = profile;
  });

  $effect.pre(() => {
    combinedClass.current = combined ?? null;
  });

  $effect(() => {
    rewriteURL();
  });

  onDestroy(() => {
    abortController.abort();
  });
</script>

<svelte:window bind:innerWidth />

<div class="@container/parent relative">
  <!-- TODO: Re-enable paneforge once this is fixed: https://github.com/svecosystem/paneforge/issues/89 -->
  <!-- <PaneGroup id="panes" direction="horizontal" autoSaveId="paneConfig" class="relative w-full !overflow-x-clip !overflow-y-visible">
    {#if innerWidth >= 1024}
      <div class="group/pane contents">
        <Pane
          id="skinPane"
          defaultSize={defaultLeftPanel}
          collapsedSize={0}
          collapsible={true}
          order={0}
          onResize={(size) => {
            leftSize = size;
            if (size < 15) {
              leftPane.collapse();
              skinCollapsed = true;
            } else {
              leftPane.expand();
              skinCollapsed = false;
            }
          }}
          bind:this={leftPane}>
          <div class="relative flex h-full items-center justify-center">
            <div class="fixed top-1/2 z-10 -translate-y-1/2">
              {#if !skinCollapsed}
                {#if preferences.performanceMode}
                  <Avatar.Root>
                    {#snippet child({ props })}
                      <div transition:fade={{ duration: 300, easing: cubicOut }} {...props}>
                        <Avatar.Image loading="lazy" src="https://nmsr.nickac.dev/fullbody/{profile.uuid}?no=shadow" alt="{profile.username}'s avatar" class="max-h-[32rem] object-cover" />
                        <Avatar.Fallback>
                          <Image class="size-24 object-cover text-foreground" />
                        </Avatar.Fallback>
                      </div>
                    {/snippet}
                  </Avatar.Root>
                {:else if browser && innerWidth >= 1024}
                   {#await import('$lib/components/misc/Skin3D.svelte') then { default: Skin3D }}
                    <Skin3D class="h-full" />
                  {/await}
                {/if}
              {/if}
            </div>
          </div>
        </Pane>

        <PaneResizer class="fixed top-1/2 left-(--size) z-20 flex w-2 -translate-x-1 -translate-y-[calc(50%-1.5rem)] items-center justify-center rounded-xs opacity-30 transition-opacity duration-300 ease-out group-hover/pane:opacity-100" style="--size: {leftSize}%">
          <div class="absolute h-[50dvh] w-2 rounded-xs bg-primary transition-[clip-path] duration-300 ease-out [clip-path:inset(50%_0_50%_0)] group-hover/pane:[clip-path:inset(0_0_0_0)]"></div>

          <div class="z-10 flex h-7 min-w-5 items-center justify-center rounded-xl bg-muted transition-colors duration-300 ease-out group-hover/pane:bg-primary">
            <GripVertical class="size-4 text-foreground/80" />
          </div>
        </PaneResizer>
      </div>
    {/if}

    <Pane
      id="statsPane"
      defaultSize={defaultRightPanel}
      class="relative z-10 !overflow-x-clip !overflow-y-visible"
      order={1}
      onResize={(size) => {
        rightSize = size;
      }}>
      <div class="fixed top-0 right-0 h-dvh w-(--width) glass dark:glass-brightness-50 light:glass-brightness-100" style="--width: {skinCollapsed ? 100 : rightSize}%"></div>
      <main data-vaul-drawer-wrapper class="@container relative mx-auto mt-12">
        <div class="space-y-5 p-4 @[75rem]/parent:p-8">
          <PlayerProfile />
          <Skills />
          <Stats />
          <AdditionalStats />
        </div>

        <Navbar>
          <Sections />
        </Navbar>
      </main>
    </Pane>
  </PaneGroup> -->
  <!-- TODO: See the paneforge todo above  -->
  <div class="@container fixed top-1/2 left-0 z-10 hidden h-dvh w-[30vw] -translate-y-1/2 @[75rem]/parent:block">
    {#if showStaticSkin}
      <Avatar.Root class="flex size-full items-center justify-center">
        {#snippet child({ props })}
          <div transition:fade={{ duration: 300, easing: cubicOut }} {...props}>
            <Avatar.Image loading="lazy" src="https://nmsr.nickac.dev/fullbody/{profile.uuid}?no=shadow" alt="{profile.username}'s avatar" class="max-h-128 object-cover" />
            <Avatar.Fallback>
              <Image class="size-24 object-cover text-foreground" />
            </Avatar.Fallback>
          </div>
        {/snippet}
      </Avatar.Root>
    {:else if browser && innerWidth >= 1210}
      <Skin3D showStaticSkin={() => (showStaticSkin = true)} class="h-full" />
    {/if}
  </div>

  <div class="fixed top-12 right-0 min-h-dvh w-full dark:bg-background/50 @[75rem]/parent:w-[70%]"></div>
  <main data-vaul-drawer-wrapper class="@container relative mx-auto @[75rem]/parent:ml-[30%]">
    {#if getProfileContext().current}
      <div class="space-y-5 p-4 @[75rem]/parent:p-8">
        <PlayerProfile />
        <Skills />
        <Stats />
        <AdditionalStats />
      </div>

      <Navbar>
        <Sections />
      </Navbar>
    {/if}
  </main>
</div>

{#if isHover.current}
  <Dialog.Root bind:open={internalState.showItem}>
    <Dialog.Content class="standard:bg-transparent flex flex-col w-auto glass glass-bg-popover gap-0 p-0 max-h-[calc(96%-3rem)]! max-w-[calc(100vw-2.5rem)]! data-[mctooltip=true]:ring-0 overflow-hidden font-skyblock-icons select-text data-[mctooltip=true]:rounded-sm *:data-[slot='dialog-close']:hidden" data-mctooltip={preferences.mctooltip}>
      <ItemContent piece={internalState.itemContent!} />
    </Dialog.Content>
  </Dialog.Root>
  <Dialog.Root
    bind:open={() => internalState.itemContentSpecial !== undefined, (open) => open}
    onOpenChange={(open) => {
      if (!open) {
        internalState.itemContentSpecial = undefined;
      }
    }}>
    <Dialog.Content class="max-h-[calc(96%-3rem)]! flex flex-col p-0 max-w-[calc(100vw-2.5rem)]! w-auto standard:bg-transparent overflow-hidden *:data-[slot='dialog-close']:hidden glass glass-bg-popover font-skyblock-icons select-text">
      {#if internalState.itemContentSpecial?.containsItems}
        <ContainedItemsGrid items={internalState.itemContentSpecial.containsItems} onclose={() => (internalState.itemContentSpecial = undefined)} />
      {/if}
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open={internalState.showItem} shouldScaleBackground={true} setBackgroundColorOnScale={false}>
    <Drawer.Content class="before:glass before:glass-bg-popover p-2 [&>div:first-child]:hidden! before:p-0 before:bg-transparent">
      <ItemContent piece={internalState.itemContent!} isDrawer={true} />
    </Drawer.Content>
  </Drawer.Root>
  <Drawer.Root
    bind:open={() => internalState.itemContentSpecial !== undefined, (open) => open}
    shouldScaleBackground={false}
    setBackgroundColorOnScale={false}
    onOpenChange={(open) => {
      if (!open) {
        internalState.itemContentSpecial = undefined;
      }
    }}>
    <Drawer.Content class="before:glass before:glass-bg-popover [&>div:first-child]:my-4 before:bg-transparent">
      {#if internalState.itemContentSpecial?.containsItems}
        <ContainedItemsGrid items={internalState.itemContentSpecial.containsItems} onclose={() => (internalState.itemContentSpecial = undefined)} />
      {/if}
    </Drawer.Content>
  </Drawer.Root>
{/if}

{#if preferences.showGlint}
  <svg xmlns="http://www.w3.org/2000/svg" height="0" width="0" class="fixed">
    <filter id="enchanted-glint">
      <feImage href="/img/enchanted-glint.gif" preserveAspectRatio="none" result="IMAGE"></feImage>
      <feBlend in="IMAGE" in2="SourceGraphic" mode="screen" result="BLEND"></feBlend>
      <feComposite operator="in" in="BLEND" in2="SourceGraphic"></feComposite>
    </filter>
  </svg>
{/if}
