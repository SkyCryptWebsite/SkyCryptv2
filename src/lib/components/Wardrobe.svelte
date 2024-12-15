<script lang="ts">
  import Item from "$lib/components/Item.svelte";
  import type { ProcessedItem } from "$lib/types/global";
  import { Avatar, Collapsible } from "bits-ui";
  import { writable } from "svelte/store";
  import { slide } from "svelte/transition";

  export let wardrobeItems: ProcessedItem[];

  const highestItem = wardrobeItems.find((piece) => piece);
  const pieces = ["helmet", "chestplate", "leggings", "boots"];

  const expanded = writable<boolean>(false);
</script>

<Collapsible.Root bind:open={$expanded}>
  <Collapsible.Trigger class="mt-2 flex flex-col gap-2">
    {#if !$expanded}
      {#if highestItem}
        <Item piece={highestItem} />
      {/if}
    {:else}
      <Collapsible.Content transition={slide} class="flex flex-col gap-2">
        {#each wardrobeItems as piece, index}
          {#if piece}
            <Item {piece} />
          {:else}
            <Avatar.Root class="rounded-lg bg-background-lore p-2">
              <Avatar.Image class="size-14" loading="eager" src={`/img/textures/item/empty_armor_slot_${pieces[index]}.png`} />
            </Avatar.Root>
          {/if}
        {/each}
      </Collapsible.Content>
    {/if}
  </Collapsible.Trigger>
</Collapsible.Root>
