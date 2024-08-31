<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const minions = profile.minions;

  console.log(minions);
</script>

<Items title="Minions">
  <div slot="text">
    <AdditionStat text="Unique Minions" data="{minions.maxedTiers} / {minions.totalTiers}" subData="({((100 * minions.maxedTiers) / minions.totalTiers).toFixed(0)}%)" />
    <AdditionStat text="Minion Slots" data={minions.minionsSlots.current} subData="({minions.minionsSlots.next} to next slot)" />
    <AdditionStat text="Bonus Minion Slots" data="{minions.minionsSlots.bonusSlots} / 5" />
    <AdditionStat text="Maxed Minions" data="{minions.maxedMinions} / {minions.totalMinions}" />
  </div>
  {#each Object.entries(minions.minions) as [category, data]}
    <span>{category}</span>
    {#each data.minions as minion}
      <Chip image={{ src: minion.texture }}>
        <div class="flex flex-col">
          {minion.name}

          <div class="relative text-2xl font-black">
            <span class="absolute animate-bounce bg-gradient-to-tr from-red-500 to-yellow-500 bg-clip-text text-transparent">
              TRADE AT <a href="https://minionah.com">minionah.com</a>
            </span>
            <span class="absolute animate-ping bg-gradient-to-tr from-red-500 to-yellow-500 bg-clip-text text-transparent">
              TRADE AT <a href="https://minionah.com">minionah.com</a>
            </span>
          </div>
        </div>
      </Chip>
    {/each}
  {/each}
</Items>
