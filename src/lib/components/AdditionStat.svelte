<script lang="ts">
  import { RARITY_COLORS } from "$constants/items";
  import { cn, flyAndScale } from "$lib/utils";
  import { Tooltip } from "bits-ui";

  export let text: string;
  export let data: string | number;
  export let subData: string | undefined = undefined;
  export let asterisk: boolean = false;
  export let maxed: boolean = false;
  export let dataMaxed: boolean = false;
  export let textRarityColor: string | undefined = undefined;
  export let dataRarityColor: string | undefined = undefined;
  export let subDataRarityColor: string | undefined = undefined;

  let className: string | null | undefined = undefined;
  export { className as class };
</script>

<Tooltip.Root group="additional-stats" openDelay={0} closeDelay={0}>
  <Tooltip.Trigger asChild={!asterisk} class={cn(`my-0 flex items-center gap-1 font-bold text-text/60 data-[is-tooltip=false]:cursor-default`, { "text-maxed": maxed }, className)} data-is-tooltip={asterisk}>
    <div class={!asterisk ? cn("my-0 flex items-center gap-1 font-bold text-text/60 data-[is-tooltip=false]:cursor-default", { "text-maxed": maxed }, className) : "contents"}>
      <div style={textRarityColor ? `color: var(--§${RARITY_COLORS[textRarityColor]})` : ""} class="capitalize">
        {text}:
      </div>

      <span class={cn("-mr-0.5", maxed || dataMaxed ? "text-gold" : "text-text")}>
        <span style={dataRarityColor ? `color: var(--§${RARITY_COLORS[dataRarityColor]})` : ""}>
          {data}
        </span>

        {#if subData}
          <span class="text-text/80" style={subDataRarityColor ? `color: var(--§${RARITY_COLORS[subDataRarityColor]})` : ""}> {subData}</span>
        {/if}
      </span>

      {#if asterisk}
        *
      {/if}
    </div>
  </Tooltip.Trigger>
  {#if asterisk}
    <Tooltip.Content class="z-50 rounded-lg bg-background-grey p-4" transition={flyAndScale} transitionConfig={{ y: 8, duration: 150 }} sideOffset={6} side="top" align="center">
      <slot />
      <Tooltip.Arrow />
    </Tooltip.Content>
  {/if}
</Tooltip.Root>
