<script lang="ts">
  import Item from "$lib/components/Item.svelte";
  import type { IsHover } from "$lib/hooks/is-hover.svelte";
  import type { ProcessedSkyBlockItem } from "$types/stats";
  import { Avatar, Collapsible } from "bits-ui";
  import { getContext } from "svelte";
  import { writable } from "svelte/store";
  import { slide } from "svelte/transition";

  export let wardrobeItems: ProcessedSkyBlockItem[];

  const highestItem = wardrobeItems.find((piece) => piece && piece.display_name);
  const pieces = ["helmet", "chestplate", "leggings", "boots"];

  const isHover = getContext<IsHover>("isHover");

  const expanded = writable<boolean>(false);

  if (!isHover.current) {
    expanded.set(true);
  }
</script>

<Collapsible.Root bind:open={$expanded} disabled={!isHover.current}>
  <Collapsible.Trigger class="mt-2 flex flex-col gap-2">
    {#if !$expanded}
      {#if highestItem}
        <Item piece={highestItem} />
      {/if}
    {:else}
      <Collapsible.Content transition={slide} class="flex flex-col gap-2">
        {#each wardrobeItems as piece, index}
          {#if piece && piece.display_name}
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
