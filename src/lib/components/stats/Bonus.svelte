<script lang="ts">
  import { getAllStatsContext } from "$ctx";
  import { cn } from "$lib/shared/utils";
  import type { ItemStats } from "$types";
  import { format } from "numerable";

  type Props = {
    stats: ItemStats;
    title?: string;
    class?: string;
  };

  let { stats, title = "Bonus:", class: classNames }: Props = $props();

  const statsData = $derived(Object.entries(stats));
  const allStats = $derived(getAllStatsContext().current);
</script>

{#if statsData.length > 0}
  <p class={cn("space-x-0.5 leading-6 font-bold text-muted-foreground capitalize", classNames)}>
    <span>{title}</span>
    {#each statsData as [key, value], index (index)}
      {const displayKey = allStats.find((stat) => stat.id === key)}
      {#if displayKey}
        <span class="text-minecraft-{displayKey.color}">
          {format(value)}{displayKey.suffix}
          {displayKey.nameTiny}
        </span>
        {#if statsData.length - 1 !== index}
          // {" "}
        {/if}
      {:else}
        {console.warn("Unknown stat:", key)}
      {/if}
    {/each}
  </p>
{/if}
