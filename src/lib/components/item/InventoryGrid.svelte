<script lang="ts">
  import { getPreferences } from "$ctx";
  import EmptyStat from "$lib/components/EmptyStat.svelte";
  import { type ModelsStrippedItem } from "$lib/shared/api/orval-generated";
  import { shouldShine } from "$lib/shared/helper";
  import { Separator } from "$ui/separator";
  import PackageSearchIcon from "@lucide/svelte/icons/package-search";
  import type { Snippet } from "svelte";

  const preferences = getPreferences();

  let { inventoryId, gap, itemSnippet, items = [] }: { inventoryId: string; gap: number; itemSnippet: Snippet<[ModelsStrippedItem]>; items?: ModelsStrippedItem[] } = $props();
</script>

{#snippet content(items: ModelsStrippedItem[] | undefined)}
  {#if items?.length ?? 0 > 0}
    <div class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 @md:gap-1.5 @xl:gap-2">
      {#each items as item, index (index)}
        {#if index > 0}
          {#if index % gap === 0}
            <Separator class="col-span-full my-4" />
          {/if}
        {/if}
        {#if item.texture_path}
          <div class="relative flex aspect-square items-center size-full overflow-clip border justify-center rounded-xl bg-text/4 data-[shine=true]:shine" data-shine={!preferences.performanceMode && shouldShine(item)}>
            {@render itemSnippet(inventoryId === "inventory" ? ({ ...item, rarity: item.rarity ?? "uncommon" } as ModelsStrippedItem) : item)}
          </div>
        {:else}
          <div class="aspect-square rounded-xl border bg-text/4"></div>
        {/if}
      {/each}
    </div>
  {:else}
    <EmptyStat title="No items found" description="No items found in {inventoryId.replaceAll('_', ' ')}" icon={PackageSearchIcon} class="mt-2" />
  {/if}
{/snippet}

{@render content(items)}
