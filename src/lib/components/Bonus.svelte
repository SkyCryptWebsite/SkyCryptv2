<script lang="ts">
  import { STATS_DATA } from "$constants/stats";
  import { cn } from "$lib/utils";

  export let stats;
  export let title = "Bonus:";

  let classNames: string | undefined = undefined;
  export { classNames as class };

  const statsData = Object.entries(stats);
</script>

<p class={cn("space-x-0.5 font-bold capitalize leading-6 text-text/60", classNames)}>
  <span>{title}</span>
  {#each statsData as [key, value], index}
    <span class={STATS_DATA[key].color}>
      {value}{STATS_DATA[key].suffix}
      {STATS_DATA[key].nameTiny}
    </span>
    {#if statsData.length - 1 !== index}
      // {" "}
    {/if}
  {/each}
</p>
