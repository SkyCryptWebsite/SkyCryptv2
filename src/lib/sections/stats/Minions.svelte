<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { getContext } from "svelte";
  //import {romanize } from "$lib/helper";

  const profile = getContext<StatsType>("profile");

  const minions = profile.minions;
</script>

<Items title="Minions">
  <div slot="text">
    <AdditionStat text="Unique Minions" data={`${minions.maxedTiers} / ${minions.totalTiers} (${Math.round((minions.maxedTiers / minions.totalTiers) * 100)}%)`} />
    <AdditionStat text="Minion Slots" data={`${minions.minionsSlots.current} (${minions.minionsSlots.next} to next slot)`} />
    <AdditionStat text="Bonus Minion Slots" data={`${minions.minionsSlots.bonusSlots} / 5`} />
    <AdditionStat text="Maxed Minions" data={`${minions.maxedMinions} / ${minions.totalMinions}`} />
  </div>

  {#each Object.entries(minions.minions) as [name, category]}
    {@const max = category.maxedMinions === category.totalMinions ? "MAX!" : `(${category.maxedMinions} / ${category.totalMinions} MAX)`}
    <Items subtitle={name + " " + max}>
      {#each category.minions as minion}
        <Chip name={minion.name} tier={minion.tiers.at(-1) ?? 0} texture={minion.texture}>
          <div class="flex items-center gap-2 text-lg font-bold text-text/60">
            {#each Array.from({ length: minion.maxTier }, (_, index) => index + 1) as tier}
              {#if minion.tiers.at(tier - 1) !== undefined}
                <p class="text-icon/90">{tier}</p>
              {:else}
                <p>{tier}</p>
              {/if}
            {/each}
          </div>
        </Chip>
      {/each}
    </Items>
  {/each}
</Items>
