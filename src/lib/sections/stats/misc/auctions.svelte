<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { RARITY_COLORS } from "$lib/shared/constants/rarities";
  import { Label } from "$ui/label";
  import { format } from "numerable";

  const misc = $derived(getMiscContext().misc);
</script>

{#if misc && misc.auctions != null}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Auctions Sold</SectionSubtitle>
    <div class="space-y-0.5">
      <AdditionStat text="Fees" data={format(misc.auctions.fees)} />
      <AdditionStat text="Coins Earned" data={format(misc.auctions.gold_earned)} />
      {#if misc.auctions.total_sold && misc.auctions.total_sold.total !== 0}
        <AdditionStat text="Items Sold" data={format(misc.auctions.total_sold.total)} asterisk={true}>
          <div class="space-y-1">
            {#each Object.entries(misc.auctions.total_sold) as [rarity, amount], index (index)}
              {#if rarity !== "total"}
                <Label class="gap-1 capitalize">
                  <span style="color: var(--§{RARITY_COLORS[rarity.toLowerCase()]})"
                    >{rarity.replaceAll("_", " ").toLowerCase()}:</span>
                  <span class="font-bold">{format(amount)}</span>
                </Label>
              {/if}
            {/each}
          </div>
        </AdditionStat>
      {/if}
    </div>
  </div>

  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Auctions Bought</SectionSubtitle>
    <div class="space-y-0.5">
      <AdditionStat text="Bids" data={format(misc.auctions.bids)} />
      <AdditionStat text="Highest Bid" data={format(misc.auctions.highest_bid)} />
      <AdditionStat text="Won" data={format(misc.auctions.won)} />
      <AdditionStat text="Coins Spent" data={format(misc.auctions.gold_spent)} />
      {#if misc.auctions.total_bought && misc.auctions.total_bought.total !== 0}
        <AdditionStat text="Items Bought" data={format(misc.auctions.total_bought.total)} asterisk={true}>
          <div class="space-y-1">
            {#each Object.entries(misc.auctions.total_bought) as [rarity, amount], index (index)}
              {#if rarity !== "total"}
                <Label class="gap-1 capitalize">
                  <span style="color: var(--§{RARITY_COLORS[rarity.toLowerCase()]})"
                    >{rarity.replaceAll("_", " ").toLowerCase()}:</span>
                  <span class="font-bold">{format(amount)}</span>
                </Label>
              {/if}
            {/each}
          </div>
        </AdditionStat>
      {/if}
    </div>
  </div>
{/if}
