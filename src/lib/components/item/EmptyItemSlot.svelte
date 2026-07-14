<script lang="ts" module>
  export const emptySlotImages = {
    helmet: "/img/textures/item/empty-slots/slot_helmet.avif",
    chestplate: "/img/textures/item/empty-slots/slot_chestplate.avif",
    leggings: "/img/textures/item/empty-slots/slot_leggings.avif",
    boots: "/img/textures/item/empty-slots/slot_boots.avif",
    necklace: "/img/textures/item/empty-slots/slot_necklace.avif",
    cloak: "/img/textures/item/empty-slots/slot_cloak.avif",
    belt: "/img/textures/item/empty-slots/slot_belt.avif",
    gloves: "/img/textures/item/empty-slots/slot_gloves_alternate.avif",
    pet: "/img/textures/item/empty-slots/slot_pet.avif",
    backpack: "/img/textures/item/empty-slots/slot_backpack.avif",
    axe: "/img/textures/item/empty-slots/slot_axe.avif",
    hoe: "/img/textures/item/empty-slots/slot_hoe.avif",
    pickaxe: "/img/textures/item/empty-slots/slot_pickaxe.avif",
    shovel: "/img/textures/item/empty-slots/slot_shovel.avif",
    sword: "/img/textures/item/empty-slots/slot_sword.avif",
    fishing: "/img/textures/item/empty-slots/slot_fishing_rod.avif"
  } as const;

  export type EmptyItemSlotType = keyof typeof emptySlotImages;
</script>

<script lang="ts">
  import { cn } from "$lib/shared/utils";

  type Props = {
    slot: EmptyItemSlotType;
    class?: string;
  };

  let { slot, class: className }: Props = $props();

  const image = $derived(emptySlotImages[slot]);
  const label = $derived(`Empty ${slot} slot`);
</script>

<div
  data-slot="empty-item-slot"
  data-empty-slot={slot}
  aria-label={label}
  class={cn("flex size-18 items-center justify-center rounded-xl bg-background/30 p-2", className)}>
  <div
    class="size-14 bg-contain bg-center bg-no-repeat [image-rendering:pixelated]"
    style:background-image={`url("${image}")`}>
  </div>
</div>
