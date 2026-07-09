<script lang="ts">
  import { Notice } from "$components/notices";
  import { getInternalState, getMobileContext, getPreferences, getProfileContext } from "$ctx";
  import { InventoryGrid, InventorySearch, Item } from "$lib/components/item";
  import { ScrollItems } from "$lib/components/misc";
  import { Section } from "$lib/components/sections";
  import { type ModelsInventory, type ModelsStrippedItem } from "$lib/shared/api/orval-generated";
  import { getInventories } from "$lib/shared/api/skycrypt-api.remote";
  import { renderLore, shouldShine } from "$lib/shared/helper";
  import { animateObfuscatedText } from "$lib/shared/mc-text/obfuscated";
  import { cn } from "$lib/shared/utils";
  import * as Avatar from "$ui/avatar";
  import { ScrollArea } from "$ui/scroll-area";
  import { Separator } from "$ui/separator";
  import { Spinner } from "$ui/spinner";
  import Image from "@lucide/svelte/icons/image";
  import { Tabs } from "bits-ui";
  import { cubicOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";

  const preferences = getPreferences();
  const internalState = getInternalState();
  const isMobile = getMobileContext();

  let { order }: { order: number } = $props();
  let openTab = $state<string>("");
  let searchValue = $state<string>();

  const profile = $derived(getProfileContext().current);
  const profileId = $derived(profile?.profile_id);
  const uuid = $derived(profile?.uuid);
  const tabsOrientation = $derived(isMobile.current ? "horizontal" : "vertical");

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicOut
  });

  function handleTabChange(value: string) {
    openTab = value;

    if (internalState.itemContentSpecial && (value === "Search" || value === "Backpack" || value === "Museum" || value === "Sacks")) {
      console.warn("Item content special should not be set for search, backpack, sacks, or museum tabs.");
      internalState.itemContentSpecial = undefined;
    }
  }
</script>

<Section id="Inventory" {order} class="min-h-150">
  <svelte:boundary>
    {const inventories = $derived<ModelsInventory[]>(uuid && profileId ? await getInventories({ uuid, profileId }) : [])}
    {const selectedInventory = $derived(openTab ? inventories.find((inventory) => inventory.name === openTab) : undefined)}
    {const selectedTabName = $derived(selectedInventory?.name ?? inventories[0]?.name ?? "")}
    {const currentInventory = $derived(selectedInventory ?? inventories[0])}
    {const usesNestedInventoryView = $derived(selectedTabName === "Backpack" || selectedTabName === "Museum" || selectedTabName === "Sacks")}
    {#snippet pending()}
      <div class="p-4 rounded-xl border flex items-center-safe gap-1">
        <Spinner />
        <span>Loading Inventory Data</span>
      </div>
    {/snippet}
    {#snippet failed(err, reset)}
      <Notice type="error" title="Failed to load inventory data" error={err instanceof Error ? err.message : String(err)} retry={reset} />
    {/snippet}
    {#if inventories.length && currentInventory}
      <Tabs.Root bind:value={() => selectedTabName, handleTabChange} class="group/tabs relative mb-0 flex flex-col rounded-xl border md:flex-row" orientation={tabsOrientation}>
        {#if isMobile.current}
          <ScrollItems>
            <Tabs.List class="relative mx-auto flex h-auto! w-fit items-center justify-center gap-1 overflow-clip rounded-xl p-2 bg-transparent text-base">
              {@render inventoryTabItems(inventories, selectedTabName)}
            </Tabs.List>
          </ScrollItems>
          <Separator orientation="horizontal" />
        {:else}
          <div class="@container-scroll flex h-fit relative w-full md:sticky md:top-1/4 md:w-fit">
            <Tabs.List class="bg-transparent rounded-xl @stuck-top:bg-background/50 h-fit transition-colors duration-150">
              <ScrollArea class="h-144" orientation="vertical" type="auto" viewportClasses="scroll-fade-track-y rounded-xl rounded-br-none">
                <div class="flex flex-col gap-3 px-4 py-4">
                  {@render inventoryTabItems(inventories, selectedTabName)}
                </div>
                <div class="pointer-events-none sticky -bottom-1 z-10 -mt-36 h-36 w-full bg-linear-to-t from-background/80 to-transparent blur-xs scroll-fade-y"></div>
              </ScrollArea>
            </Tabs.List>
            <Separator orientation="vertical" class="h-144!" />
          </div>
        {/if}

        <Tabs.Content class="mx-auto sm:my-4 sm:py-4 w-full p-2 sm:p-0 md:my-0 md:px-4" value={selectedTabName}>
          {#if selectedTabName === "Search"}
            {#if uuid && profileId}
              <InventorySearch bind:search={searchValue} {uuid} {profileId} {itemSnippet} />
            {/if}
          {:else if usesNestedInventoryView}
            {@render multipleInventorySection(currentInventory?.items ?? [], currentInventory)}
          {:else}
            <InventoryGrid inventoryId={selectedTabName} gap={currentInventory.separatorAfter ?? 45} {itemSnippet} items={currentInventory.items ?? []} />
          {/if}
        </Tabs.Content>
      </Tabs.Root>
    {/if}
  </svelte:boundary>
</Section>

{#snippet inventoryTabItems(inventories: ModelsInventory[], selectedTabName: string)}
  {#each inventories as tabItem (tabItem.name)}
    <Tabs.Trigger value={tabItem.name || ""} class={cn("relative flex items-center-safe gap-2 p-2 data-[state=active]:bg-transparent! isolate capitalize whitespace-nowrap", !isMobile.current && "group-data-vertical/tabs:rounded-full group-data-vertical/tabs:border-border")} data-active={selectedTabName === tabItem.name}>
      {#if selectedTabName === tabItem.name}
        <div class="absolute inset-0 rounded-full bg-primary opacity-40" in:send={{ key: "active-tab" }} out:receive={{ key: "active-tab" }}></div>
      {/if}
      <Avatar.Root class="size-8 after:rounded-none after:border-none">
        <Avatar.Image loading="lazy" src={tabItem.texture} class="size-8 object-contain rounded-none" />
        <Avatar.Fallback class="bg-transparent">
          <Image class="size-8" />
        </Avatar.Fallback>
      </Avatar.Root>
      {tabItem.name}
    </Tabs.Trigger>
  {/each}
{/snippet}

{#snippet itemSnippet(item: ModelsStrippedItem)}
  <Item piece={item} isInventory={true} showRecombobulated={false} showCount={true} />
{/snippet}

{#snippet emptyItem()}
  <div class="aspect-square rounded-xl border bg-text/4"></div>
{/snippet}

{#snippet gap()}
  <Separator class="col-span-full my-4" />
{/snippet}

{#snippet multipleInventorySection(items: ModelsStrippedItem[], currentInventory: ModelsInventory)}
  <Tabs.Root value={currentInventory?.name}>
    <Tabs.List class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 @md:gap-1.5 @xl:gap-2">
      {#if items?.length}
        {#each items as item, index (index)}
          <Tabs.Trigger value={item.texture_path ? index.toString() : "undefined"} class="group">
            {#snippet child({ props })}
              <div {...props}>
                {#if item.texture_path}
                  <div class="relative flex aspect-square items-center justify-center rounded-xl border overflow-clip group-data-[state=active]:bg-text/10 group-data-[state=inactive]:bg-text/4 data-[shine=true]:shine" data-shine={!preferences.performanceMode && shouldShine(item)}>
                    {@render itemSnippet(item)}
                  </div>
                {:else}
                  {@render emptyItem()}
                {/if}
              </div>
            {/snippet}
          </Tabs.Trigger>
        {/each}
      {/if}
    </Tabs.List>

    {#if items?.length}
      {#each items as item, index (index)}
        <Tabs.Content value={index.toString()}>
          <div class="grid place-content-center gap-1 @md:gap-1.5 @xl:gap-2" {@attach animateObfuscatedText}>
            <div class="rounded-xl my-4 border bg-background/50 p-4">
              {#if item?.lore}
                {#each item?.lore as lore, index (index)}
                  {@html renderLore(lore)}
                {/each}
              {/if}
            </div>
          </div>
          <div class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 @md:gap-1.5 @xl:gap-2">
            {@render gap()}
            {#if item?.containsItems}
              {#each item.containsItems as containedItem, index2 (index2)}
                {#if index2 > 0}
                  {#if index2 % 54 === 0}
                    {@render gap()}
                  {/if}
                {/if}
                <Tabs.Content value={index.toString()}>
                  {#if containedItem.texture_path}
                    <div class="relative flex aspect-square items-center justify-center rounded-xl border overflow-clip bg-text/4 data-[shine=true]:shine" data-shine={!preferences.performanceMode && shouldShine(item)}>
                      {@render itemSnippet(containedItem)}
                    </div>
                  {:else}
                    {@render emptyItem()}
                  {/if}
                </Tabs.Content>
              {/each}
            {/if}
          </div>
        </Tabs.Content>
      {/each}
    {/if}
  </Tabs.Root>
{/snippet}
