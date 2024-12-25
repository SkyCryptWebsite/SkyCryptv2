<script lang="ts">
  import { page } from "$app/stores";
  import type { IsHover } from "$lib/hooks/is-hover.svelte";
  import { RARITIES, RARITY_COLORS } from "$lib/shared/constants/items";
  import { getRarityClass, isEnchanted, removeFormatting, renderLore } from "$lib/shared/helper";
  import { cn, flyAndScale } from "$lib/shared/utils";
  import type { ProcessedItem, ProcessedPet } from "$lib/types/global";
  import { Avatar, Tooltip } from "bits-ui";
  import Image from "lucide-svelte/icons/image";
  import { getContext } from "svelte";
  import { Drawer } from "vaul-svelte";

  let { piece, isInventory, showCount, showRecombobulated }: { piece: ProcessedItem | ProcessedPet; isInventory: boolean; showCount: boolean; showRecombobulated: boolean } = $props();

  const pieceItem = piece as ProcessedItem;
  const processedPet = piece as unknown as ProcessedPet;
  const itemName = pieceItem.tag?.display?.Name ?? piece.display_name ?? "???";
  const itemNameHtml = renderLore(itemName);
  const isMulticolor = (itemNameHtml.match(/<\/span>/g) || []).length > 1;
  const bgColor = piece.rarity ? getRarityClass(piece.rarity.toLowerCase() as string, "bg") : "bg-background";
  const enchanted = isEnchanted(pieceItem);
  const recombobulated = showRecombobulated && pieceItem.recombobulated;
  const shine = enchanted || pieceItem.shiny;

  const showNumbers = showCount && pieceItem.Count > 1;

  const isHover = getContext<IsHover>("isHover");
</script>

{#snippet item()}
  <div class={cn(`relative flex aspect-square items-center justify-center overflow-clip rounded-lg`, isInventory ? "p-0" : `p-2 ${bgColor}`, { shine: shine })}>
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
        {pieceItem.Count}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet tooltip()}
  <Tooltip.Root group="armor" openDelay={0} closeDelay={0}>
    <Tooltip.Trigger class={cn(`relative flex aspect-square items-center justify-center overflow-clip rounded-lg`, isInventory ? "p-0" : `p-2 ${bgColor}`, { shine: shine })}>
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
          {item.Count}
        </div>
      {/if}
    </Tooltip.Trigger>
    <Tooltip.Content class="z-50 flex max-h-[calc(96%-48px)] w-max min-w-96 max-w-[calc(100vw-2.5rem)] select-text flex-col overflow-hidden rounded-lg bg-background-lore font-icomoon" transition={flyAndScale} transitionConfig={{ x: -8, duration: 150 }} sideOffset={8} side="right" align="center">
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
      <div class="nice-colors-auto mx-auto w-full max-w-md overflow-auto p-6 font-semibold leading-snug">
        {#if pieceItem.tag?.display?.Lore}
          {#each pieceItem.tag.display.Lore as lore}
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
{/snippet}

{#snippet drawer()}
  <Drawer.Root shouldScaleBackground={true}>
    <Drawer.Trigger>
      {@render item()}
    </Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Overlay class="fixed inset-0 z-[998] bg-black/80" />
      <Drawer.Content class="fixed bottom-0 left-0 right-0 z-[999] mx-[5%] flex max-h-[96%] flex-col rounded-t-[10px] bg-background-lore">
        <div class={cn(`flex flex-nowrap items-center justify-center gap-4 rounded-t-[10px] p-5`, bgColor)}>
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

        <div class="nice-colors-auto mx-auto w-full max-w-md overflow-auto p-6 font-semibold leading-snug">
          {#if pieceItem.tag?.display?.Lore}
            {#each pieceItem.tag.display.Lore as lore}
              {@html renderLore(lore)}
            {/each}
          {:else if processedPet.lore}
            {#each processedPet.lore as lore}
              {@html renderLore(lore)}
            {/each}
          {/if}
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
{/snippet}

<div class="nice-colors-dark contents">
  {#if isHover.current}
    {@render tooltip()}
  {:else}
    {@render drawer()}
  {/if}
</div>
