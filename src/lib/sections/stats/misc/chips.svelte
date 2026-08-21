<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { Chip } from "$lib/components/misc";
  import ScrollAreaItems from "$lib/components/ScrollAreaItems.svelte";
  import { SectionSubtitle } from "$lib/components/sections";
  import { cn } from "$lib/shared/utils";
  import { IsMobile } from "$src/lib/hooks/is-mobile.svelte";
  import { format } from "numerable";

  interface ChipData {
    amount?: number;
    maxAmount?: number;
    name?: string;
    texture?: string;
  }

  const misc = $derived(getMiscContext().misc);

  const isMobile = new IsMobile();
</script>

{#if misc && misc.essence != null}
  {@render chips("Essence", misc.essence)}
{/if}

{#if misc && misc.consumables != null}
  {@render chips("Consumables", misc.consumables)}
{/if}

{#snippet chips(title: string, data: ChipData[])}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>{title}</SectionSubtitle>
    <ScrollAreaItems
      class="relative w-full"
      viewportClasses="max-h-160 pr-2"
      orientation={isMobile.current ? "horizontal" : "vertical"}>
      {#each data as item, index (index)}
        {const hasUnlocked = item.amount}
        {const hasMaxed = item.maxAmount != null && item.amount === item.maxAmount}
        <Chip image={{ src: item.texture ?? "" }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}>
          <div class="flex flex-col">
            <div class="font-bold whitespace-nowrap">
              <span class={cn(hasMaxed ? "text-accent-2" : "opacity-60")}>{item.name}</span>
              <div class={cn("text-sm", hasMaxed ? "text-accent-4" : "text-foreground")}>
                <span class="opacity-60">Amount:</span>
                <span>
                  {format(item.amount)}{#if item.maxAmount != null}/{item.maxAmount}{/if}
                </span>
              </div>
            </div>
          </div>
        </Chip>
      {/each}
    </ScrollAreaItems>
  </div>
{/snippet}
