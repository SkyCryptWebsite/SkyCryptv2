<script lang="ts">
  import { getInternalState } from "$ctx";
  import { Item } from "$lib/components/item";
  import type { ModelsStrippedItem } from "$lib/shared/api/orval-generated";

  type Props = {
    items: ModelsStrippedItem[];
    onclose: () => void;
  };

  let { items, onclose }: Props = $props();
  const internalState = getInternalState();
</script>

{#if internalState.itemContentSpecial}
  <div
    class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 p-4 @md:gap-1.5 @xl:gap-2">
    {#if items && items.length !== 0}
      {#each items as containedItem, index (index)}
        {#if index > 0}
          {#if index % 54 === 0}
            <hr class="col-span-full h-4 border-0" />
          {/if}
        {/if}
        {#if containedItem.texture_path}
          <div
            class="relative flex aspect-square items-center justify-center overflow-clip rounded-xl border bg-foreground/5"
            onclick={onclose}
            role="none">
            <Item piece={containedItem} isInventory={true} showRecombobulated={false} showCount={true} />
          </div>
        {:else}
          <div class="aspect-square size-full rounded-xl border bg-foreground/5"></div>
        {/if}
      {/each}
    {/if}
  </div>
{/if}
