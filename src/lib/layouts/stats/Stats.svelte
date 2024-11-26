<script lang="ts">
  import Stat from "$lib/components/Stat.svelte";
  import { getPlayerStats } from "$lib/shared/player_stats";
  import type { Stats as StatsType } from "$lib/types/stats";

  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const stats = getPlayerStats(profile);
</script>

<div class="stats flex max-h-44 flex-col sm:flex-wrap">
  {#each Object.entries(stats) as [statName, statData]}
    <Stat stat={statName} statData={statData.total} />
  {/each}
</div>
