<script lang="ts">
  import { getPreferences } from "$ctx";
  import { SectionBoundary } from "$lib/components/sections";
  import { type ModelsStrippedItem } from "$lib/shared/api/orval-generated";
  import { searchInventorySection } from "$lib/shared/api/skycrypt-api.remote";
  import { shouldShine } from "$lib/shared/helper";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import { Input } from "$ui/input";
  import SearchIcon from "@lucide/svelte/icons/search";
  import SearchX from "@lucide/svelte/icons/search-x";
  import { Debounced } from "runed";
  import type { Snippet } from "svelte";

  const preferences = getPreferences();

  let { search = $bindable(), uuid, profileId, itemSnippet }: { search?: string; uuid: string; profileId: string; itemSnippet: Snippet<[ModelsStrippedItem]> } = $props();

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
  <EmptyStat title="Try searching for something" description="Anything your heart desires" icon={SearchIcon} class="mt-4" />
{:else}
  {#key debouncedSearch.current}
    <SectionBoundary query={() => searchInventorySection({ uuid, profileId, searchParam: debouncedSearch.current! })}>
      {#snippet children(items: ModelsStrippedItem[])}
        {#if !items || items.length === 0}
          <EmptyStat title="No items found" description="Hmm... couldn't find anything for your query" icon={SearchX} class="mt-4" />
        {:else if debouncedSearch.current !== ""}
          <div class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 pt-5 @md:gap-1.5 @xl:gap-2">
            {#each items as item, index (index)}
              {#if item}
                <div class="relative flex aspect-square items-center justify-center rounded-sm bg-foreground/4 data-[shine=true]:shine" data-shine={!preferences.performanceMode && shouldShine(item)}>
                  {@render itemSnippet(item)}
                </div>
              {:else}
                <div class="aspect-square rounded-sm bg-foreground/4"></div>
              {/if}
            {/each}
          </div>
        {/if}
      {/snippet}
    </SectionBoundary>
  {/key}
{/if}
