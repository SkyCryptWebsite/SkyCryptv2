<script lang="ts" generics="TItem">
  import { getMobileContext } from "$ctx";
  import EmptyStat from "$lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$lib/components/ScrollAreaItems.svelte";
  import { cn } from "$lib/shared/utils";
  import ScrollArea from "$src/lib/components/ui/scroll-area/scroll-area.svelte";
  import { Input } from "$ui/input";
  import * as Tabs from "$ui/tabs";
  import { type Icon as IconType } from "@lucide/svelte";
  import SearchXIcon from "@lucide/svelte/icons/search-x";
  import type { Snippet } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import ScrollItems from "./ScrollItems.svelte";

  type SearchTab = {
    value: string;
    label: string;
    items: TItem[];
    triggerClass?: string;
    activeClass?: string;
  };

  type Props = {
    tabs: SearchTab[];
    item: Snippet<[TItem]>;
    itemKey: (item: TItem, index: number) => string | number;
    searchKeys?: (item: TItem) => (string | null | undefined)[];
    tabHeader?: Snippet<[string]>;
    placeholder?: string;
    class?: string;
    orientation?: "horizontal" | "vertical";
    viewportClasses?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: typeof IconType;
    noResultsLabel?: string;
  };

  let {
    tabs,
    item,
    itemKey,
    searchKeys,
    tabHeader,
    placeholder = "Search",
    class: className = "border p-4 rounded-xl",
    orientation = "horizontal",
    viewportClasses = "max-h-160 pr-2",
    emptyTitle = "No items found",
    emptyDescription = "Hmm... couldn't find anything for your query",
    emptyIcon = SearchXIcon,
    noResultsLabel = "Nothing matches your search."
  }: Props = $props();

  const isMobile = getMobileContext();
  const effectiveOrientation = $derived(orientation === "vertical" && !isMobile.current ? "vertical" : "horizontal");
  const isVertical = $derived(effectiveOrientation === "vertical");

  let search = $state("");
  let selected = $state("");

  const normalize = (value?: string | null) => value?.trim().toLocaleLowerCase() ?? "";

  const filteredTabs = $derived.by(() => {
    const query = normalize(search);

    return tabs.map((tab) => {
      const items =
        !query || !searchKeys
          ? tab.items
          : tab.items.filter((entry) => searchKeys(entry).some((value) => normalize(value).includes(query)));
      return { ...tab, items };
    });
  });

  const totalResults = $derived(filteredTabs.reduce((total, tab) => total + tab.items.length, 0));
  const tabsWithResults = $derived(new Set(filteredTabs.filter((tab) => tab.items.length > 0).map((tab) => tab.value)));
  const currentValue = $derived.by(() => {
    if (tabsWithResults.has(selected)) return selected;
    return filteredTabs.find((tab) => tabsWithResults.has(tab.value))?.value ?? tabs[0]?.value ?? "";
  });

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicOut
  });
</script>

<div class={className}>
  <Input
    type="search"
    {placeholder}
    bind:value={search}
    onkeydown={(event) => {
      event.stopPropagation();
    }} />
  {#if totalResults === 0}
    <EmptyStat title={emptyTitle} description={emptyDescription} icon={emptyIcon} class="mt-4" />
  {:else}
    <Tabs.Root
      orientation={effectiveOrientation}
      bind:value={() => currentValue, (value) => (selected = value)}
      class={cn("mt-4", isVertical && "gap-4")}>
      {#if isVertical}
        <Tabs.List
          class="sticky top-2 flex h-fit shrink-0 flex-col items-stretch justify-start gap-1 self-start border bg-transparent text-base">
          <ScrollArea class="h-144" orientation="vertical" type="auto" viewportClasses="rounded-xl scroll-fade-track-y">
            <div class="flex flex-col gap-3 pr-4">
              {@render tabsListItems()}
            </div>
            <div
              class="pointer-events-none sticky -bottom-1 z-10 -mt-36 h-36 w-full bg-linear-to-t from-background/80 to-transparent scroll-fade-y blur-xs">
            </div>
          </ScrollArea>
        </Tabs.List>
      {:else}
        <ScrollItems>
          <Tabs.List
            class="relative mx-auto flex h-auto! w-fit items-center justify-center gap-1 overflow-clip rounded-full border bg-transparent text-base">
            {@render tabsListItems()}
          </Tabs.List>
        </ScrollItems>
      {/if}

      {#each filteredTabs as tab (tab.value)}
        <Tabs.Content value={tab.value} class={isVertical ? "min-w-0 flex-1" : "pt-4"}>
          {@render tabHeader?.(tab.value)}
          {#if tab.items.length === 0}
            <p class="space-x-0.5 leading-6">{noResultsLabel}</p>
          {:else}
            <ScrollAreaItems class="relative w-full" {viewportClasses} orientation="vertical">
              {#each tab.items as entry, index (itemKey(entry, index))}
                {@render item(entry)}
              {/each}
            </ScrollAreaItems>
          {/if}
        </Tabs.Content>
      {/each}
    </Tabs.Root>
  {/if}
</div>

{#snippet tabsListItems()}
  {#each filteredTabs as tab (tab.value)}
    {const isActive = $derived(currentValue === tab.value)}
    <Tabs.Trigger
      value={tab.value}
      class={cn(
        "relative isolate h-auto px-4 py-2 font-semibold whitespace-nowrap capitalize data-[state=active]:bg-transparent!",
        isVertical && "w-full justify-start text-left",
        tab.triggerClass
      )}
      disabled={!tabsWithResults.has(tab.value)}>
      {#if isActive}
        <div
          class={cn("absolute inset-0 rounded-full bg-primary opacity-40", tab.activeClass)}
          in:send={{ key: "active-tab" }}
          out:receive={{ key: "active-tab" }}>
        </div>
      {/if}
      {tab.label.replaceAll("_", " ")}
    </Tabs.Trigger>
  {/each}
{/snippet}
