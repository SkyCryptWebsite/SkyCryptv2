<script lang="ts">
  import { getMiscContext } from "$ctx";
  import ScrollAreaItems from "$lib/components/ScrollAreaItems.svelte";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { Separator } from "$ui/separator";
  import { format } from "numerable";
  import VirtualList from "svelte-tiny-virtual-list";

  const misc = $derived(getMiscContext().misc);

  const sortedKills = $derived(
    misc?.kills?.kills ? [...misc.kills.kills].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0)) : []
  );
  const sortedDeaths = $derived(
    misc?.kills?.deaths ? [...misc.kills.deaths].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0)) : []
  );
</script>

{#if misc && misc.kills != null}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Kills</SectionSubtitle>
    <div class="space-y-0.5">
      <AdditionStat text="Total Kills" data={format(misc.kills.total_kills)} />
      <AdditionStat text="Total Deaths" data={format(misc.kills.total_deaths)} />
    </div>
    {#if (misc.kills.kills && misc.kills.kills.length > 0) || (misc.kills.deaths && misc.kills.deaths.length > 0)}
      <ScrollAreaItems>
        {#if misc.kills.kills}
          <div class="flex min-w-88 flex-col gap-1 rounded-xl border bg-background/50 py-4 @md:min-w-96">
            <div class="flex w-full items-center justify-center gap-1.5 text-center font-semibold">Kills</div>
            <Separator class="bg-primary" />
            <VirtualList
              height={320}
              width="100%"
              itemCount={misc.kills.kills.length}
              itemSize={misc.kills.kills.length > 0 ? 20 : 0}
              scrollDirection="vertical">
              {#snippet item({ index, style })}
                <div {style} class="px-4 font-semibold whitespace-nowrap">
                  <div class="inline-block text-muted-foreground capitalize">#{index + 1}</div>
                  <div class="inline-block text-foreground">{sortedKills[index].name}</div>
                  <div class="inline-block text-muted-foreground">: {format(sortedKills[index].amount)}</div>
                </div>
              {/snippet}
            </VirtualList>
          </div>
        {/if}
        {#if misc.kills.deaths}
          <div class="flex min-w-88 flex-col gap-1 rounded-xl border bg-background/50 py-4 @md:min-w-96">
            <div class="flex w-full items-center justify-center gap-1.5 text-center font-semibold">Deaths</div>
            <Separator class="bg-primary" />
            <VirtualList
              height={320}
              width="100%"
              itemCount={misc.kills.deaths.length}
              itemSize={misc.kills.deaths.length > 0 ? 20 : 0}
              scrollDirection="vertical">
              {#snippet item({ index, style })}
                <div {style} class="px-4 font-semibold whitespace-nowrap">
                  <div class="inline-block text-muted-foreground capitalize">#{index + 1}</div>
                  <div class="inline-block text-foreground">{sortedDeaths[index].name}</div>
                  <div class="inline-block text-muted-foreground">: {format(sortedDeaths[index].amount)}</div>
                </div>
              {/snippet}
            </VirtualList>
          </div>
        {/if}
      </ScrollAreaItems>
    {/if}
  </div>
{/if}
