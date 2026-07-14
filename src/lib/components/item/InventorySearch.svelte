<script lang="ts">
  import { SectionBoundary } from "$lib/components/sections";
  import { type ModelsStrippedItem } from "$lib/shared/api/orval-generated";
  import { searchProfileInventory } from "$lib/shared/api/skycrypt-api.remote";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import { Input } from "$ui/input";
  import SearchIcon from "@lucide/svelte/icons/search";
  import SearchX from "@lucide/svelte/icons/search-x";
  import { Debounced } from "runed";
  import type { Snippet } from "svelte";

  let {
    search = $bindable(),
    uuid,
    profileId,
    itemSnippet
  }: { search?: string; uuid: string; profileId: string; itemSnippet: Snippet<[ModelsStrippedItem]> } = $props();

  const debouncedSearch = $state(new Debounced(() => search, 300));
</script>

<Input
  type="search"
  placeholder="Search all inventories"
  class=""
  bind:value={search}
  onkeydown={(e) => {
    e.stopPropagation();
  }} />
{#if debouncedSearch.current === "" || !debouncedSearch.current}
  <EmptyStat
    title="Try searching for something"
    description="Anything your heart desires"
    icon={SearchIcon}
    class="mt-4" />
{:else}
  {#key debouncedSearch.current}
    <SectionBoundary query={() => searchProfileInventory({ uuid, profileId, searchParam: debouncedSearch.current! })}>
      {#snippet children(items: ModelsStrippedItem[])}
        {#if !items || items.length === 0}
          <EmptyStat
            title="No items found"
            description="Hmm... couldn't find anything for your query"
            icon={SearchX}
            class="mt-4" />
        {:else if debouncedSearch.current !== ""}
          <div
            class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 pt-5 @md:gap-1.5 @xl:gap-2">
            {#each items as item, index (index)}
              {#if item}
                <div
                  class="relative flex aspect-square size-full items-center justify-center overflow-clip rounded-xl border bg-foreground/5">
                  {@render itemSnippet(item)}
                </div>
              {:else}
                <div class="aspect-square rounded-xl border bg-foreground/5"></div>
              {/if}
            {/each}
          </div>
        {/if}
      {/snippet}
    </SectionBoundary>
  {/key}
{/if}
