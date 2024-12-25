<script lang="ts">
  import { STATS_DATA } from "$lib/shared/constants/stats";
  import { cn } from "$lib/shared/utils";

  export let stats;
  export let title = "Bonus:";

  let classNames: string | undefined = undefined;
  export { classNames as class };

  const statsData = Object.entries(stats);

  function formatValue(value: string) {
    return parseFloat(value)
      .toFixed(2)
      .replace(/\.?0+$/, "");
  }
</script>

<p class={cn("my-4 space-x-0.5 font-bold capitalize leading-6 text-text/60", classNames)}>
  <span>{title}</span>
  {#each statsData as [key, value], index}
    <span class={STATS_DATA[key].color}>
      {formatValue(value as string)}{STATS_DATA[key].suffix}
      {STATS_DATA[key].nameTiny}
    </span>
    {#if statsData.length - 1 !== index}
      // {" "}
    {/if}
  {/each}
</p>
