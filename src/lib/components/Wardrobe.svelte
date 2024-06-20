<script lang="ts">
  import Item from "$lib/components/Item.svelte";
  import type { ProcessedItem } from "$types/global";
  import { Collapsible } from "bits-ui";
  import { writable } from "svelte/store";
  import { slide } from "svelte/transition";

  export let wardrobeItems: ProcessedItem[];

  const expanded = writable<boolean>(false);

  $: highestItem = wardrobeItems.find((piece) => piece);

  const pieces = ["helmet", "chestplate", "leggings", "boots"];
</script>

<Collapsible.Root bind:open={$expanded}>
  <Collapsible.Trigger class="mt-2 flex flex-col gap-2">
    {#if !$expanded}
      {#if highestItem}
        <Item piece={highestItem} />
      {/if}
    {:else}
      <div in:slide={{ duration: 500 }} out:slide={{ duration: 500 }} class="mt-2 flex flex-col gap-2">
        {#each wardrobeItems as piece, index}
          {#if piece}
            <Item {piece} />
          {:else}
            <img class="flex size-24 items-center justify-center rounded-lg bg-background-lore" src={`/img/textures/item/empty_armor_slot_${pieces[index]}.png`} alt="Empty armor slot" />
          {/if}
        {/each}
      </div>
    {/if}
  </Collapsible.Trigger>
</Collapsible.Root>
