<script lang="ts">
  import { genericTooltipTether, getInternalState } from "$ctx";
  import { RARITY_COLORS } from "$lib/shared/constants/rarities";
  import * as Item from "$ui/item";
  import * as Tooltip from "$ui/tooltip";
  import { cn } from "$utils";
  import Info from "@lucide/svelte/icons/info";
  import { type Snippet } from "svelte";

  type Props = {
    text: string;
    data: string | number;
    subData?: string | undefined;
    asterisk?: boolean;
    maxed?: boolean;
    dataMaxed?: boolean;
    textRarityColor?: string | undefined;
    dataRarityColor?: string | undefined;
    subDataRarityColor?: string | undefined;
    class?: string | null | undefined;
    children?: Snippet;
  };

  let { text, data, subData = undefined, asterisk = false, maxed = false, dataMaxed = false, textRarityColor = undefined, dataRarityColor = undefined, subDataRarityColor = undefined, class: className = undefined, children }: Props = $props();

  let asteriskRef = $state<HTMLElement | null>(null);

  const internalState = getInternalState();
</script>

{#if asterisk}
  <Tooltip.Trigger
    class={cn("p-0 gap-2 w-fit data-[is-tooltip=false]:cursor-default", { "text-accent-2": maxed }, className)}
    data-is-tooltip={asterisk}
    onclick={() => (internalState.content = children)}
    tether={genericTooltipTether}
    payload={{
      class: "z-50 performance:bg-popover space-y-2 rounded-xl bg-transparent glass border glass-bg-popover p-4 text-sm",
      sideOffset: 8,
      side: "top",
      align: "center",
      customAnchor: asteriskRef,
      showTooltip: asterisk,
      children
    }}>
    {#snippet child({ props })}
      <Item.Root {...props}>
        {@render additionalStatLabel()}
      </Item.Root>
    {/snippet}
  </Tooltip.Trigger>
{:else}
  <Item.Root class={cn(`p-0 gap-2 w-fit data-[is-tooltip=false]:cursor-default`, { "text-accent-2": maxed }, className)}>
    {@render additionalStatLabel()}
  </Item.Root>
{/if}

{#snippet additionalStatLabel()}
  <Item.Content class="flex text-base font-bold text-muted-foreground items-center flex-row w-fit">
    <div class={!asterisk ? cn("my-0 flex items-center gap-1 font-bold text-muted-foreground data-[is-tooltip=false]:cursor-default", { "text-accent-2": maxed }, className) : "contents"}>
      <div style={textRarityColor ? `color: var(--§${RARITY_COLORS[textRarityColor]})` : ""} class="capitalize">
        {text}:
      </div>

      <span class={cn("-mr-0.5", maxed || dataMaxed ? "text-accent-2" : "text-foreground")}>
        <span style={dataRarityColor ? `color: var(--§${RARITY_COLORS[dataRarityColor]})` : ""}>
          {data}
        </span>

        {#if subData}
          <span class="text-foreground/80" style={subDataRarityColor ? `color: var(--§${RARITY_COLORS[subDataRarityColor]})` : ""}> {subData}</span>
        {/if}
      </span>

      {#if asterisk}
        <Item.Media variant="icon" bind:ref={asteriskRef} class="size-3 -translate-y-1">
          <Info />
        </Item.Media>
      {/if}
    </div>
  </Item.Content>
{/snippet}
