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

  let {
    text,
    data,
    subData = undefined,
    asterisk = false,
    maxed = false,
    dataMaxed = false,
    textRarityColor = undefined,
    dataRarityColor = undefined,
    subDataRarityColor = undefined,
    class: className = undefined,
    children
  }: Props = $props();

  let asteriskRef = $state<HTMLElement | null>(null);

  const internalState = getInternalState();
</script>

{#if asterisk}
  <Tooltip.Trigger
    class={cn("w-fit gap-2 p-0 data-[is-tooltip=false]:cursor-default", { "text-accent-2": maxed }, className)}
    data-is-tooltip={asterisk}
    onclick={() => (internalState.content = children)}
    tether={genericTooltipTether}
    payload={{
      class:
        "z-50 space-y-2 rounded-xl border glass bg-transparent p-4 text-sm glass-bg-popover performance:bg-popover",
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
  <Item.Root
    class={cn(`w-fit gap-2 p-0 data-[is-tooltip=false]:cursor-default`, { "text-accent-2": maxed }, className)}>
    {@render additionalStatLabel()}
  </Item.Root>
{/if}

{#snippet additionalStatLabel()}
  <Item.Content class="flex w-fit flex-row items-center text-base font-bold text-muted-foreground">
    <div
      class={!asterisk
        ? cn(
            "my-0 flex items-center gap-1 font-bold text-muted-foreground data-[is-tooltip=false]:cursor-default",
            { "text-accent-2": maxed },
            className
          )
        : "contents"}>
      <div style={textRarityColor ? `color: var(--§${RARITY_COLORS[textRarityColor]})` : ""} class="capitalize">
        {text}:
      </div>

      <span class={cn("-mr-0.5", maxed || dataMaxed ? "text-accent-2" : "text-foreground")}>
        <span style={dataRarityColor ? `color: var(--§${RARITY_COLORS[dataRarityColor]})` : ""}>
          {data}
        </span>

        {#if subData}
          <span
            class="text-foreground/80"
            style={subDataRarityColor ? `color: var(--§${RARITY_COLORS[subDataRarityColor]})` : ""}>
            {subData}</span>
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
