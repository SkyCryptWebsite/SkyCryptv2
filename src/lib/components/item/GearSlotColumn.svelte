<script lang="ts">
  import type { ModelsStrippedItem } from "$lib/shared/api/orval-generated";
  import { cn } from "$lib/shared/utils";
  import EmptyItemSlot, { type EmptyItemSlotType } from "./EmptyItemSlot.svelte";
  import Item from "./Item.svelte";

  type Props = {
    items?: (ModelsStrippedItem | undefined)[];
    emptySlots: EmptyItemSlotType[];
    label?: string;
    class?: string;
  };

  let { items = [], emptySlots, label, class: className }: Props = $props();

  const slots = $derived(emptySlots.map((emptySlot, index) => ({ emptySlot, item: items[index] })));
</script>

<div data-slot="gear-slot-column" class={cn("flex shrink-0 flex-col gap-2", className)}>
  {#if label}
    <span class="text-center text-xs font-semibold tracking-wide text-foreground/60 uppercase">{label}</span>
  {/if}

  <div class="flex flex-col gap-2">
    {#each slots as { emptySlot, item }, index (index)}
      {#if item?.display_name}
        <div data-slot="gear-slot-item">
          <Item piece={item} />
        </div>
      {:else}
        <EmptyItemSlot slot={emptySlot} />
      {/if}
    {/each}
  </div>
</div>
