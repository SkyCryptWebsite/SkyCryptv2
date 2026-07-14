<script lang="ts">
  import { getCombinedContext } from "$ctx";
  import { Chip, SearchTabs } from "$lib/components/misc";
  import { Section } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { cn } from "$lib/shared/utils";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import LibraryBigIcon from "@lucide/svelte/icons/library-big";
  import { format } from "numerable";

  let { order }: { order: number } = $props();

  const collections = $derived(getCombinedContext().current?.collections);

  const categoryTabs = $derived.by(() => {
    if (!collections?.categories) return [];

    return Object.entries(collections.categories).map(([key, data]) => ({
      value: key,
      label: data.name ?? key,
      items: data.items ?? [],
      triggerClass: "text-white"
    }));
  });
</script>

<Section id="Collections" {order}>
  {#if collections}
    <div class="contents space-y-4">
      <div class="rounded-xl border p-4">
        <div class="space-y-0.5">
          <AdditionStat
            text="Maxed Collections"
            data="{collections.maxedCollections} / {collections.totalCollections}"
            maxed={collections.maxedCollections === collections.totalCollections} />
        </div>
      </div>

      <SearchTabs
        tabs={categoryTabs}
        placeholder="Search collections"
        searchKeys={(item) => [item.name]}
        itemKey={(item, index) => item.id ?? item.name ?? index}
        noResultsLabel="No collections match your search.">
        {#snippet tabHeader(value)}
          {const data = collections.categories?.[value]}
          {#if data}
            <div class="mb-4 text-base font-semibold uppercase">
              {#if data.maxTiers === data.totalTiers}
                <span class="text-accent-4">Max!</span>
              {:else}
                <span class="text-foreground/80">{data.maxTiers} / {data.totalTiers} maxed</span>
              {/if}
            </div>
          {/if}
        {/snippet}
        {#snippet item(item)}
          {const hasUnlocked = item.totalAmount}
          {const hasMaxed = item.tier === item.maxTier}
          <Chip image={{ src: item.texture ?? "" }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}>
            <div class="flex flex-col">
              <div class="font-bold whitespace-nowrap">
                <span class={cn(hasMaxed ? "text-accent-2" : "opacity-60")}>{item.name}</span>
                <span class={cn({ "text-accent-4": hasMaxed })}>{item.tier}</span>
                <div class="text-sm">
                  <span class="opacity-60">Amount:</span>
                  <span class="text-foreground">{format(item.totalAmount)}</span>
                </div>
              </div>
            </div>
            {#snippet tooltip()}
              <div class="text-sm font-bold">
                {#if item.amounts && item.amounts.length > 0}
                  <div class="mb-4">
                    {#each item.amounts as user, index (index)}
                      <div>
                        <span class="opacity-85">
                          {user.username}:
                        </span>
                        <span class="text-foreground">{format(user.amount)}</span>
                      </div>
                    {/each}
                  </div>
                {/if}
                <div>
                  <span class="opacity-85"> Total: </span>
                  <span class="text-foreground opacity-100">{format(item.totalAmount)}</span>
                </div>
              </div>
            {/snippet}
          </Chip>
        {/snippet}
      </SearchTabs>
    </div>
  {:else}
    <EmptyStat title="No Data" description="This player doesn't have any collections" icon={LibraryBigIcon} />
  {/if}
</Section>
