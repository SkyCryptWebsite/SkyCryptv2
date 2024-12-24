<script lang="ts">
  import { page } from "$app/stores";
  import { RARITIES, RARITY_COLORS } from "$lib/shared/constants/items";
  import { getRarityClass, isEnchanted, removeFormatting, renderLore } from "$lib/shared/helper";
  import { cn, flyAndScale } from "$lib/shared/utils";
  import type { ProcessedItem, ProcessedPet } from "$lib/types/global";
  import { Avatar, Tooltip } from "bits-ui";
  import Image from "lucide-svelte/icons/image";

  export let piece: ProcessedItem | ProcessedPet;
  export let isInventory = false;
  export let showCount = true;
  export let showRecombobulated = true;

  const item = piece as ProcessedItem;
  const processedPet = piece as unknown as ProcessedPet;
  const itemName = item.tag?.display?.Name ?? piece.display_name ?? "???";
  const itemNameHtml = renderLore(itemName);
  const isMulticolor = (itemNameHtml.match(/<\/span>/g) || []).length > 1;
  const bgColor = piece.rarity ? getRarityClass(piece.rarity.toLowerCase() as string, "bg") : "bg-background";
  const enchanted = isEnchanted(item);
  const recombobulated = showRecombobulated && item.recombobulated;
  const shine = enchanted || item.shiny;

  const showNumbers = showCount && item.Count > 1;
</script>

<div class="nice-colors-dark contents">
  <Tooltip.Root group="armor" openDelay={0} closeDelay={0}>
    <Tooltip.Trigger class={cn(`relative flex aspect-square items-center justify-center overflow-clip rounded-lg`, isInventory ? "p-0" : `p-2 ${bgColor}`, { shine: shine })}>
      <Avatar.Root>
        <Avatar.Image loading="lazy" src={$page.url.origin + piece.texture_path} alt={piece.display_name} class="data-[enchanted=true]:enchanted h-auto w-14 select-none" data-enchanted={enchanted} />
        <Avatar.Fallback>
          <Image class="size-14" />
        </Avatar.Fallback>
      </Avatar.Root>
      {#if recombobulated && piece.rarity}
        <div class="absolute -right-3 -top-3 z-10 size-6 rotate-45 bg-[--color]" style="--color: var(--§{RARITY_COLORS[RARITIES[RARITIES.indexOf(piece.rarity) - 1]]})"></div>
      {/if}
      {#if showNumbers}
        <div class="absolute bottom-0.5 right-0.5 text-2xl font-semibold text-white text-shadow-[.1em_.1em_.1em_#000]">
          {item.Count}
        </div>
      {/if}
    </Tooltip.Trigger>
    <Tooltip.Content class="pointer-events-none z-50 w-max min-w-96 max-w-[calc(100vw-2.5rem)] select-text overflow-hidden rounded-lg bg-background-lore font-icomoon" transition={flyAndScale} transitionConfig={{ x: -8, duration: 150 }} sideOffset={8} side="right" align="center">
      <div class={cn(`flex flex-nowrap items-center justify-center gap-4 p-5`, bgColor)}>
        <Avatar.Root>
          <Avatar.Image loading="lazy" src={$page.url.origin + piece.texture_path} alt={piece.display_name} class="data-[enchanted=true]:enchanted h-auto w-8 flex-none overflow-hidden" data-enchanted={enchanted} />
          <Avatar.Fallback>
            <Image class="size-8" />
          </Avatar.Fallback>
        </Avatar.Root>

        <p class="relative flex-1 text-center text-lg font-semibold uppercase data-[multicolor=true]:rounded-full data-[multicolor=true]:bg-background-lore data-[multicolor=true]:px-2 data-[multicolor=true]:py-1 data-[multicolor=false]:text-text" data-multicolor={isMulticolor}>
          {@html isMulticolor ? itemNameHtml : removeFormatting(itemNameHtml)}
        </p>
      </div>
      <div class="nice-colors-auto p-6 font-semibold leading-snug">
        {#if item.tag?.display?.Lore}
          {#each item.tag.display.Lore as lore}
            {@html renderLore(lore)}
          {/each}
        {:else if processedPet.lore}
          {#each processedPet.lore as lore}
            {@html renderLore(lore)}
          {/each}
        {/if}
      </div>
    </Tooltip.Content>
  </Tooltip.Root>
</div>
