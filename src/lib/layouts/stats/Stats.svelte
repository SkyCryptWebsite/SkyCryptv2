<script lang="ts">
  import Stat from "$lib/components/Stat.svelte";
  import { getPlayerStats } from "$lib/shared/player_stats";
  import type { Stats as StatsType } from "$lib/types/stats";

  import { getContext } from "svelte";

  const profile = getContext<Promise<StatsType>>("profile");

  const stats = async () => getPlayerStats(await profile);
</script>

<div class="stats flex max-h-44 flex-col sm:flex-wrap">
  {#await stats}
    Loading
  {:then stats}
    {#each Object.entries(stats) as [statName, statData]}
      <Stat stat={statName} {statData} />
    {/each}
  {/await}
</div>
