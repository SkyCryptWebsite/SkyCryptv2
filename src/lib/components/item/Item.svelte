<script lang="ts">
  import { getInternalState, itemTooltipTether } from "$ctx";
  import type { ModelsStrippedItem } from "$lib/shared/api/orval-generated";
  import { RARITIES, RARITY_COLORS } from "$lib/shared/constants/rarities";
  import { formatNumber, getRarityClass } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import ImageOff from "@lucide/svelte/icons/image-off";
  import { Avatar, Tooltip, type AvatarImageLoadingStatus } from "bits-ui";
  import { IsInViewport } from "runed";
  import ResolvedItemImage from "./ResolvedItemImage.svelte";

  type Props = {
    piece: ModelsStrippedItem;
    isInventory?: boolean;
    showCount?: boolean;
    showRecombobulated?: boolean;
  };

  let { piece, isInventory, showCount, showRecombobulated = true }: Props = $props();
  let targetNode = $state<HTMLButtonElement | null>(null);
  let hasBeenInViewport = $state(false);
  let loadingStatus = $state<AvatarImageLoadingStatus>(null!);
  let resolvedTexturePack = $state<string>();

  const internalState = getInternalState();

  const inViewport = new IsInViewport(() => targetNode, { rootMargin: "200px 0px", threshold: 0 });
  const skyblockItem = $derived({ ...piece, texture_pack: resolvedTexturePack ?? piece.texture_pack });
  const bgColor = $derived(getRarityClass(piece.rarity ?? ("common".toLowerCase() as string), "bg"));
  const recombobulated = $derived(showRecombobulated && (skyblockItem.recombobulated ?? false));
  const enchanted = $derived(skyblockItem?.texture_path?.includes("/api/leather/") ? false : skyblockItem.shiny);
  const showNumbers = $derived(showCount && (skyblockItem.Count ?? 0) > 1);

  $effect(() => {
    if (inViewport.current && !hasBeenInViewport) {
      hasBeenInViewport = true;
    }
  });
</script>

<Tooltip.Trigger
  class={cn("overflow-clip nice-colors-dark", isInventory ? "p-0" : `relative p-2 ${bgColor}`, { "rounded-xl": !isInventory }, "standard:transition-all standard:duration-150 standard:ease-out standard:hover:scale-110 standard:active:scale-110")}
  bind:ref={targetNode}
  onclick={() => {
    if (skyblockItem.containsItems && !skyblockItem.displayInline) {
      internalState.itemContentSpecial = skyblockItem;
      return;
    }
    internalState.itemContent = skyblockItem;
    internalState.showItem = !skyblockItem.displayInline;
  }}
  tether={itemTooltipTether}
  payload={{ skyblockItem, inViewport }}>
  {#snippet child({ props })}
    <div {...props}>
      {#if hasBeenInViewport}
        <Avatar.Root bind:loadingStatus class={cn("after:border-none", isInventory ? "size-6 sm:size-14" : "size-14")}>
          <ResolvedItemImage loading="lazy" src={piece.texture_path} alt={piece.display_name} class={cn("pointer-events-none aspect-square select-none [image-rendering:pixelated] data-[enchanted=true]:enchanted", isInventory ? "size-6 sm:size-14" : "size-14")} {enchanted} onresolved={(resolution) => (resolvedTexturePack = resolution.texture_pack)} />
          {#if loadingStatus === "loading"}
            {@render loadingState()}
          {:else}
            <Avatar.Fallback class={cn("rounded-xl", isInventory ? "size-6 sm:size-14" : "size-14")}>
              <ImageOff class="size-full" />
            </Avatar.Fallback>
          {/if}
        </Avatar.Root>
      {:else}
        {@render loadingState()}
      {/if}

      {#if recombobulated && !isInventory}
        <div class="absolute -top-3 -right-3 z-10 size-6 rotate-45 bg-(--color)" style="--color: var(--§{RARITY_COLORS[RARITIES[RARITIES.indexOf(piece.rarity ?? 'common') - 1]]})"></div>
      {/if}
    </div>
  {/snippet}
</Tooltip.Trigger>

{#if showNumbers}
  <div class="absolute right-0.5 bottom-0.5 text-xs font-semibold text-foreground text-shadow-[.1em_.1em_.1em_#000] sm:text-base">
    {formatNumber(skyblockItem.Count ?? 0)}
  </div>
{/if}

{#snippet loadingState()}
  <div class={cn("animate-pulse rounded-xl bg-foreground/30", isInventory ? "size-8 sm:size-14" : "size-14")}></div>
{/snippet}
