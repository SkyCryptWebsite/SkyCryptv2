<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

<Items title="Auctions Sold">
  <div slot="text">
    <AdditionStat text="Fees" data={format(misc.auctions.fees)} />
    <AdditionStat text="Coins Earned" data={format(misc.auctions.gold_earned)} />
    <AdditionStat text="Items Sold" data={format(misc.auctions.total_sold.total)} asterisk={true}>
      {#each Object.entries(misc.auctions.total_sold) as [rarity, amount]}
        {#if rarity !== "total"}
          <AdditionStat text={rarity} data={amount} textRarityColor={rarity.toLowerCase()} />
        {/if}
      {/each}
    </AdditionStat>
  </div>
</Items>

<Items title="Auctions Bought">
  <div slot="text">
    <AdditionStat text="Bids" data={format(misc.auctions.bids)} />
    <AdditionStat text="Highest Bid" data={format(misc.auctions.highest_bid)} />
    <AdditionStat text="Won" data={format(misc.auctions.won)} />
    <AdditionStat text="Coins Spent" data={format(misc.auctions.gold_spent)} />
    <AdditionStat text="Items Bought" data={format(misc.auctions.total_bought.total)} asterisk={true}>
      {#each Object.entries(misc.auctions.total_bought) as [rarity, amount]}
        {#if rarity !== "total"}
          <AdditionStat text={rarity} data={amount} textRarityColor={rarity.toLowerCase()} />
        {/if}
      {/each}
    </AdditionStat>
  </div>
</Items>
