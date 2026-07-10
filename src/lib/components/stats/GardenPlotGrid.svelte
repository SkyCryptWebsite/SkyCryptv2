<script lang="ts">
  import { getHoverContext, getInternalState } from "$ctx";
  import { AdditionStat } from "$lib/components/stats";
  import { type ModelsPlotLayout } from "$lib/shared/api/orval-generated";
  import { renderLore } from "$lib/shared/helper";
  import { animateObfuscatedText } from "$lib/shared/mc-text/obfuscated";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import SectionSubtitle from "$src/lib/components/sections/SectionSubtitle.svelte";
  import * as Avatar from "$ui/avatar";
  import * as Tooltip from "$ui/tooltip";
  import Image from "@lucide/svelte/icons/image";

  let { plot }: { plot: ModelsPlotLayout | undefined } = $props();

  const isHover = getHoverContext();
  const internalState = getInternalState();

  const allMaxed = $derived(plot?.unlocked === plot?.total);
</script>

<div class="flex items-center gap-1 text-base font-semibold">
  <SectionSubtitle>Plots</SectionSubtitle>
  {#if allMaxed}
    <span class="text-accent-4">Max!</span>
  {:else}
    <span class="text-text/80">({plot?.unlocked} / {plot?.total} max)</span>
  {/if}
</div>

<div class="space-y-0.5">
  {#if plot?.unlocked != null && plot?.total != null}
    <AdditionStat text="Unlocked Plots" data={`${plot.unlocked}/${plot?.total}`} maxed={plot.unlocked === plot.total} />
  {/if}
  {#if plot?.barnSkin}
    <AdditionStat text="Barn Skin" data={plot.barnSkin} />
  {/if}
</div>
{#if plot}
  <ScrollAreaItems border={true} class="w-full mt-4">
    <div class="@container-normal relative mx-auto">
      <div class="grid grid-cols-[repeat(5,minmax(1.875rem,4.875rem))] place-content-center gap-1 @md:gap-1.5 @xl:gap-2">
        {#each plot.layout as plotItem, index (index)}
          {#snippet tooltipContent()}
            {#if plotItem.display_name}
              <p {@attach animateObfuscatedText}>{@html renderLore(plotItem.display_name)}</p>
            {/if}
          {/snippet}

          <Tooltip.Root disableCloseOnTriggerClick={false}>
            <Tooltip.Trigger onclick={() => (internalState.content = tooltipContent)}>
              <Avatar.Root class="flex aspect-square items-center h-auto w-14 size-auto after:border-none justify-center rounded-sm bg-text/5 p-1">
                <Avatar.Image src={plotItem.texture_path} class="h-auto w-14 select-none [image-rendering:pixelated]" />
                <Avatar.Fallback>
                  <Image class="size-full" />
                </Avatar.Fallback>
              </Avatar.Root>
            </Tooltip.Trigger>

            {#if isHover.current}
              <Tooltip.Content class="z-50 performance:bg-popover rounded-xl bg-transparent glass border glass-bg-popover p-4 text-sm" sideOffset={8} side="top" align="center" arrowClasses="hidden">
                {@render tooltipContent()}
              </Tooltip.Content>
            {/if}
          </Tooltip.Root>
        {/each}
      </div>
    </div>
  </ScrollAreaItems>
{/if}
