<script lang="ts">
  import { getPacksContext, getPreferences } from "$ctx";
  import type { ModelsStrippedItem } from "$lib/shared/api/orval-generated";
  import { getRarityClass, removeFormatting, renderLore } from "$lib/shared/helper";
  import { animateObfuscatedText } from "$lib/shared/mc-text/obfuscated";
  import { cn } from "$lib/shared/utils";
  import Image from "@lucide/svelte/icons/image";
  import Info from "@lucide/svelte/icons/info";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import { Avatar, Button } from "bits-ui";
  import ContainedItem from "./ContainedItem.svelte";
  import ResolvedItemImage from "./ResolvedItemImage.svelte";

  type Props = {
    piece: ModelsStrippedItem;
    isDrawer?: boolean;
  };

  let { piece, isDrawer }: Props = $props();
  let resolvedTexturePack = $state<string>();
  const preferences = getPreferences();

  const skyblockItem = $derived({ ...piece, texture_pack: resolvedTexturePack });
  const itemName = $derived(piece?.display_name);
  const itemNameHtml = $derived(itemName ? renderLore(itemName) : "");
  const isMulticolor = $derived((itemNameHtml?.match(/<\/span>/g) || [])?.length > 1);
  const bgColor = $derived(getRarityClass(piece?.rarity ?? ("common".toLowerCase() as string), "bg"));
  const textColor = $derived(getRarityClass(piece?.rarity ?? ("common".toLowerCase() as string), "text"));
  const enchanted = $derived(skyblockItem?.texture_path?.includes("/api/leather/") ? false : skyblockItem && "shiny" in skyblockItem ? skyblockItem.shiny : false);
  const hasColor = $derived(skyblockItem?.lore?.some((lore) => lore.includes("Color:")) ?? false);
  const packs = $derived(getPacksContext().packs);
  const packData = $derived(packs?.find((pack) => pack.id === skyblockItem?.texture_pack));
</script>

<div class="group/itemtooltip data-[mctooltip=false]:contents data-[mctooltip=true]:relative data-[mctooltip=true]:rounded-sm data-[mctooltip=true]:bg-mctooltip-bg data-[mctooltip=true]:p-0.5" {@attach animateObfuscatedText} data-mctooltip={preferences.mctooltip}>
  <div class="group-data-[mctooltip=false]/itemtooltip:contents group-data-[mctooltip=true]/itemtooltip:minecraft-tooltip group-data-[mctooltip=true]/itemtooltip:max-h-[calc(100dvh-8rem)] group-data-[mctooltip=true]/itemtooltip:overflow-auto">
    <div class={cn("flex-nowrap items-center justify-center gap-4 nice-colors-dark group-data-[mctooltip=false]/itemtooltip:flex group-data-[mctooltip=false]/itemtooltip:p-5", { "group-data-[mctooltip=false]/itemtooltip:rounded-t-[10px]": isDrawer }, preferences.mctooltip ? undefined : bgColor)}>
      <Avatar.Root class="shrink-0 px-2 group-data-[mctooltip=true]/itemtooltip:hidden">
        <ResolvedItemImage loading="lazy" src={piece?.texture_path} alt={piece?.display_name} class="h-auto w-8 flex-none shrink-0 overflow-hidden [image-rendering:pixelated] data-[enchanted=true]:enchanted" {enchanted} onresolved={(resolution) => (resolvedTexturePack = resolution.texture_pack)} />
        <Avatar.Fallback>
          <Image class="size-8" />
        </Avatar.Fallback>
      </Avatar.Root>

      <p class={cn("relative min-w-0 wrap-break-word group-data-[mctooltip=false]/itemtooltip:text-center group-data-[mctooltip=false]/itemtooltip:text-base group-data-[mctooltip=false]/itemtooltip:font-semibold group-data-[mctooltip=false]/itemtooltip:uppercase data-[multicolor=true]:rounded-full data-[multicolor=true]:py-1 group-data-[mctooltip=false]/itemtooltip:data-[multicolor=true]:bg-popover group-data-[mctooltip=false]/itemtooltip:data-[multicolor=true]:px-2 group-data-[mctooltip=false]/itemtooltip:sm:text-lg", preferences.mctooltip ? textColor : "data-[multicolor=false]:text-foreground")} data-multicolor={isMulticolor}>
        {#if preferences.mctooltip}
          {@html itemNameHtml}
        {:else}
          {@html isMulticolor ? itemNameHtml : removeFormatting(itemNameHtml)}
        {/if}
      </p>
    </div>

    <div class="w-full overflow-auto">
      <div class="w-full leading-snug font-semibold group-data-[mctooltip=false]/itemtooltip:p-6">
        {#if skyblockItem?.lore}
          {#each skyblockItem?.lore as lore, index (index)}
            {@html renderLore(lore, true, index)}
          {/each}
        {/if}

        {#if skyblockItem && "containsItems" in skyblockItem && Array.isArray(skyblockItem?.containsItems) && !skyblockItem?.containsItems.every((item) => Object.keys(item).length === 0)}
          <div class="mt-4 border-t border-foreground/10 pt-4">
            <div class="grid grid-cols-9 gap-1">
              {#each skyblockItem?.containsItems.slice(0, Math.min(skyblockItem?.containsItems.length, 54)) as containedItem, index (index)}
                {#if containedItem.texture_path}
                  <div class="flex aspect-square items-center justify-center rounded-xl bg-foreground/5">
                    <ContainedItem piece={containedItem} isInventory={true} />
                  </div>
                {:else}
                  <div class="aspect-square rounded-xl bg-foreground/5"></div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}

        {#if piece && piece.sourceTab}
          <div class="mt-4">
            <div class="flex items-center justify-between gap-4 rounded-[0.625rem] bg-foreground/5 p-2 transition-colors ease-out hover:bg-foreground/8">
              <div class="flex items-center gap-2">
                <Avatar.Root class="shrink-0 select-none">
                  <Avatar.Image loading="lazy" src={piece.sourceTab.icon} alt={piece.sourceTab.name} class="pointer-events-none aspect-square size-10 h-full rounded-xl select-none [image-rendering:pixelated]" />
                  <Avatar.Fallback class="flex size-10 items-center justify-center rounded-xl bg-primary/90 text-center font-semibold uppercase">
                    {piece.sourceTab.name?.slice(0, 2)}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div class="font-semibold text-primary">
                  You can find this item in the <span class="capitalize">{piece.sourceTab.name}</span> tab
                </div>
              </div>
            </div>
          </div>
        {/if}
        {#if hasColor}
          <div class="mt-4 flex max-w-72 items-center justify-start gap-4 rounded-[0.625rem] bg-foreground/5 p-2 transition-colors ease-out">
            <div class="flex items-center gap-2 text-muted-foreground">
              <TriangleAlert class="size-10" />
              <div class="text-sm font-semibold">Due to abuse, all leather armor uses default color values</div>
            </div>
          </div>
        {/if}
        <div class="mt-4 flex w-full flex-nowrap gap-4">
          {#if packData}
            <Button.Root href={packData.url} target="_blank">
              <div class="flex items-center justify-between gap-4 rounded-[0.625rem] bg-foreground/5 p-2 transition-colors ease-out hover:bg-foreground/8">
                <div class="flex items-center gap-2">
                  <Avatar.Root class="shrink-0 select-none">
                    <Avatar.Image loading="lazy" src={packData.icon} alt={packData.name} class="pointer-events-none aspect-square size-10 h-full rounded-xl select-none [image-rendering:pixelated]" />
                    <Avatar.Fallback class="flex size-10 items-center justify-center rounded-xl bg-primary/90 text-center font-semibold uppercase">
                      {packData.name?.slice(0, 2)}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <div class="flex flex-col">
                    <div class="font-semibold text-primary">
                      <span class="underline">
                        {packData.name}
                      </span>
                      <span class="text-sm text-muted-foreground">{packData.version}</span>
                    </div>
                    <div class="text-sm text-muted-foreground">
                      by <span class="text-foreground/80">{packData.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Button.Root>
          {/if}

          {#if piece.wiki}
            <Button.Root href={piece.wiki} target="_blank" class="flex shrink items-center justify-center rounded-[0.625rem] bg-foreground/5 p-2 whitespace-nowrap transition-colors ease-out hover:bg-foreground/8">
              {#if preferences.mctooltip}
                <span class="font-skyblock-icons light:invert text-2xl px-2 block ml-0.5 mt-0.5">ⓘ</span>
              {:else}
                <Info class="mr-2 ml-2 size-6 p-0" />
              {/if}
            </Button.Root>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
