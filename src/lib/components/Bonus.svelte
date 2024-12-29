<script lang="ts">
  import { STAT_ALIASES, STATS_DATA } from "$lib/shared/constants/stats";
  import { cn } from "$lib/shared/utils";
  import { format } from "numerable";

  export let stats;
  export let title = "Bonus:";

  let classNames: string | undefined = undefined;
  export { classNames as class };

  const statsData = Object.entries(stats);
</script>

{#if statsData.length > 0}
  <p class={cn("my-4 space-x-0.5 font-bold capitalize leading-6 text-text/60", classNames)}>
    <span>{title}</span>
    {#each statsData as [key, value], index}
      {#if STAT_ALIASES[key] !== undefined}
        {(key = STAT_ALIASES[key])}
      {/if}

      <span class={STATS_DATA[key].color}>
        {format(value as string)}{STATS_DATA[key].suffix}
        {STATS_DATA[key].nameTiny}
      </span>
      {#if statsData.length - 1 !== index}
        // {" "}
      {/if}
    {/each}
  </p>
{/if}
