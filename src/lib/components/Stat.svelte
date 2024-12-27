<script lang="ts">
  import { STATS_DATA } from "$lib/shared/constants/stats";
  import { cn, flyAndScale } from "$lib/shared/utils";
  import { Tooltip } from "bits-ui";
  import { format } from "numerable";

  export let stat: string;
  export let statData: {
    [string: string]: number;
    base: number;
  };

  let className: string | null | undefined = undefined;
  export { className as class };
</script>

<div>
  <Tooltip.Root group="stats" openDelay={0} closeDelay={0}>
    <Tooltip.Trigger class={cn(`my-0 flex items-center gap-1 text-sm font-bold ${STATS_DATA[stat].color}`, className)}>
      <div class="inline-block font-icomoon text-base">{STATS_DATA[stat].symbol}</div>
      <span class="capitalize">{stat.replace(/_/g, " ")}</span>
      <span class="text-text">
        {format(statData.total)}{#if STATS_DATA[stat]?.percent}%{/if}
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content class="z-50 space-y-4 rounded-lg bg-background-grey p-4 text-sm" transition={flyAndScale} transitionConfig={{ y: 8, duration: 150 }} sideOffset={6} side="top" align="center">
      <div>
        <h3 class="font-bold capitalize text-text/60">Base {stat.replaceAll("_", " ")}: <span class="text-text">{format(statData.base)}</span></h3>
        <p>Base value every player has at the beginning of their SkyBlock adventure!</p>
      </div>

      {#if statData.total}
        <div>
          <h3 class="font-bold capitalize text-text/60">Bonus {stat.replaceAll("_", " ")}: <span class="text-text">{format(statData.total)}</span></h3>
          <p>Bonus value obtained from:</p>

          <div class="flex flex-col">
            {#each Object.entries(statData) as [key, value]}
              {#if !["total", "base"].includes(key)}
                <div class="capitalize">- {key.replaceAll("_", " ")} +{format(value)}</div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <Tooltip.Arrow />
    </Tooltip.Content>
  </Tooltip.Root>
</div>
