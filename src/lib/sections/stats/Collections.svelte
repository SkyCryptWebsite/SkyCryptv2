<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { formatNumber } from "$lib/tools";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const collections = profile.collections;
</script>

<Items title="Collections">
  <div slot="text">
    <AdditionStat text="Maxed Collections" data={`${collections.maxedCollections} / ${collections.totalCollections}`} />
  </div>

  {#each Object.entries(collections.categories) as [_, category]}
    {@const max = category.maxTiers === category.totalTiers ? "MAX!" : `(${category.totalTiers} / ${category.maxTiers} MAX)`}
    <Items subtitle={category.name + " " + max}>
      {#each category.items as collection}
        <Chip name={collection.name} tier={collection.tier ?? 0} texture={collection.texture} extra={[["Amount", formatNumber(collection.amount)]]}>
          <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
            {#each collection.amounts as amount}
              <p>{amount.username}: {format(amount.amount)}</p>
            {/each}
            <p />
            <p>Total Amount: {format(collection.totalAmount)}</p>
          </div>
        </Chip>
      {/each}
    </Items>
  {/each}
</Items>
