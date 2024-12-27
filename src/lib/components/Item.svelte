<script lang="ts">
  import { page } from "$app/stores";
  import { RARITIES, RARITY_COLORS } from "$lib/shared/constants/items";
  import { getRarityClass, removeFormatting, renderLore } from "$lib/shared/helper";
  import { cn, flyAndScale } from "$lib/shared/utils";
  import type { ProcessedSkyBlockItem, ProcessedSkyblockPet } from "$lib/types/global";
  import { Avatar, Tooltip } from "bits-ui";
  import Image from "lucide-svelte/icons/image";
  import ContainedItem from "./ContainedItem.svelte";

  export let piece: ProcessedSkyBlockItem | ProcessedSkyblockPet;
  export let isInventory = false;
  export let showCount = true;
  export let showRecombobulated = true;

  const item = piece as ProcessedSkyBlockItem;
  const processedPet = piece as unknown as ProcessedSkyblockPet;
  const itemName = piece.display_name ?? "???";
  const itemNameHtml = renderLore(itemName);
  const isMulticolor = (itemNameHtml.match(/<\/span>/g) || []).length > 1;
  const bgColor = getRarityClass(piece.rarity ?? ("common".toLowerCase() as string), "bg");
  const recombobulated = showRecombobulated && (item.recombobulated ?? false);
  const enchanted = item.shiny;

  const showNumbers = showCount && (item.Count ?? 1) > 1;
</script>

<div class="nice-colors-dark contents">
  <Tooltip.Root group="armor" openDelay={0} closeDelay={0}>
    <Tooltip.Trigger class={cn(`relative flex aspect-square items-center justify-center overflow-clip rounded-lg`, isInventory ? "p-0" : `p-2 ${bgColor}`, { shine: enchanted })}>
      <Avatar.Root>
        <Avatar.Image loading="lazy" src={$page.url.origin + piece.texture_path} alt={piece.display_name} class="data-[enchanted=true]:enchanted h-auto w-14 select-none" data-enchanted={enchanted} />
        <Avatar.Fallback>
          <Image class="size-14" />
        </Avatar.Fallback>
      </Avatar.Root>
      {#if recombobulated}
        <div class="absolute -right-3 -top-3 z-10 size-6 rotate-45 bg-[--color]" style="--color: var(--§{RARITY_COLORS[RARITIES[RARITIES.indexOf(piece.rarity ?? 'common') - 1]]})"></div>
      {/if}
      {#if showNumbers}
        <div class="absolute bottom-0.5 right-0.5 text-2xl font-semibold text-white text-shadow-[.1em_.1em_.1em_#000]">
          {item.Count ?? 1}
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
        {#if item.lore}
          {#each item.lore as lore}
            {@html renderLore(lore)}
          {/each}
        {:else if processedPet.lore}
          {#each processedPet.lore as lore}
            {@html renderLore(lore)}
          {/each}
        {/if}
        {#if item.containsItems && item.containsItems.length > 0}
          <div class="mt-4 border-t border-text/10 pt-4">
            <div class="grid grid-cols-9 gap-1">
              {#each item.containsItems.slice(0, Math.min(item.containsItems.length, 54)) as containedItem}
                {#if containedItem.texture_path}
                  <div class="flex aspect-square items-center justify-center rounded bg-text/[0.04]">
                    <ContainedItem piece={containedItem} />
                  </div>
                {:else}
                  <div class="aspect-square rounded bg-text/[0.04]"></div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </Tooltip.Content>
  </Tooltip.Root>
</div>
