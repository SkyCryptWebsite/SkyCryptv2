<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { format } from "numerable";

  const { misc } = getProfileCtx();
</script>

{#if misc.auctions != null}
  <SectionSubtitle class="!uppercase">Auctions Sold</SectionSubtitle>
  <Items>
    <div slot="text">
      <AdditionStat text="Fees" data={format(misc.auctions.fees)} />
      <AdditionStat text="Coins Earned" data={format(misc.auctions.gold_earned)} />
      <AdditionStat text="Items Sold" data={format(misc.auctions.total_sold.total)} asterisk={true}>
        {#each Object.entries(misc.auctions.total_sold) as [rarity, amount]}
          {#if rarity !== "total"}
            <AdditionStat text={rarity} data={format(amount)} textRarityColor={rarity.toLowerCase()} />
          {/if}
        {/each}
      </AdditionStat>
    </div>
  </Items>

  <SectionSubtitle class="!uppercase">Auctions Bought</SectionSubtitle>
  <Items>
    <div slot="text">
      <AdditionStat text="Bids" data={format(misc.auctions.bids)} />
      <AdditionStat text="Highest Bid" data={format(misc.auctions.highest_bid)} />
      <AdditionStat text="Won" data={format(misc.auctions.won)} />
      <AdditionStat text="Coins Spent" data={format(misc.auctions.gold_spent)} />
      <AdditionStat text="Items Bought" data={format(misc.auctions.total_bought.total)} asterisk={true}>
        {#each Object.entries(misc.auctions.total_bought) as [rarity, amount]}
          {#if rarity !== "total"}
            <AdditionStat text={rarity} data={format(amount)} textRarityColor={rarity.toLowerCase()} />
          {/if}
        {/each}
      </AdditionStat>
    </div>
  </Items>
{/if}
