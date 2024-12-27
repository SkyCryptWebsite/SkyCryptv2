<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import { format } from "numerable";
  import VirtualList from "svelte-tiny-virtual-list";

  const { misc } = getProfileCtx();
</script>

{#if misc.kills != null}
  <div class="space-y-4">
    <SectionSubtitle class="!uppercase">Kills</SectionSubtitle>
    <div>
      <AdditionStat text="Total Kills" data={format(misc.kills.total_kills)} />
      <AdditionStat text="Total Deaths" data={format(misc.kills.total_deaths)} />
    </div>
    <div class="flex flex-wrap gap-4">
      <div class="flex min-w-[22rem] flex-col gap-1 rounded-lg bg-background/30 @md:min-w-96">
        <div class="flex w-full items-center justify-center gap-1.5 border-b-2 border-icon py-2 text-center font-semibold uppercase">Kills</div>
        <VirtualList height={320} width="100%" itemCount={misc.kills.kills.length} itemSize={misc.kills.kills.length > 0 ? 20 : 0} scrollDirection="vertical">
          <div slot="item" let:index let:style {style} class="px-4 font-semibold">
            <div class="inline-block capitalize text-text/60">#{index + 1}</div>
            <div class="inline-block text-text">{misc.kills.kills[index].name}</div>
            <div class="inline-block text-text/60">: {format(misc.kills.kills[index].amount)}</div>
          </div>
        </VirtualList>
      </div>
      <div class="flex min-w-[22rem] flex-col gap-1 rounded-lg bg-background/30 @md:min-w-96">
        <div class="flex w-full items-center justify-center gap-1.5 border-b-2 border-icon py-2 text-center font-semibold uppercase">Deaths</div>
        <VirtualList height={320} width="100%" itemCount={misc.kills.deaths.length} itemSize={misc.kills.deaths.length > 0 ? 20 : 0} scrollDirection="vertical">
          <div slot="item" let:index let:style {style} class="px-4 font-semibold">
            <div class="inline-block capitalize text-text/60">#{index + 1}</div>
            <div class="inline-block text-text">{misc.kills.deaths[index].name}</div>
            <div class="inline-block text-text/60">: {format(misc.kills.deaths[index].amount)}</div>
          </div>
        </VirtualList>
      </div>
    </div>
  </div>
{/if}
