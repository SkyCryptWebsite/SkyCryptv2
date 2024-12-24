<script lang="ts">
  import Stat from "$lib/components/Stat.svelte";
  import { getPlayerStats } from "$lib/shared/player_stats";
  import type { Stats as StatsType } from "$lib/types/stats";
  import { Collapsible } from "bits-ui";
  import { quadInOut } from "svelte/easing";

  import { getContext } from "svelte";
  import { slide } from "svelte/transition";

  const profile = getContext<StatsType>("profile");

  const stats = getPlayerStats(profile);
</script>

<div class="stats flex flex-col">
  <Collapsible.Root>
    <Collapsible.Content class="columns-[12.5rem]" transition={slide} transitionConfig={{ duration: 300, easing: quadInOut }}>
      {#each Object.entries(stats) as [statName, statData]}
        <Stat stat={statName} {statData} />
      {/each}
    </Collapsible.Content>
    <Collapsible.Trigger class="mx-auto mt-3.5 w-full rounded-full bg-text/10 p-2.5 text-xs font-semibold uppercase">Show Stats</Collapsible.Trigger>
  </Collapsible.Root>
</div>
