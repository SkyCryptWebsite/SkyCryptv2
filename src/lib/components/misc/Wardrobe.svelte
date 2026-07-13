<script lang="ts">
  import type { EmptyItemSlotType } from "$lib/components/item/EmptyItemSlot.svelte";
  import GearSlotColumn from "$lib/components/item/GearSlotColumn.svelte";
  import type { ModelsStrippedItem } from "$lib/shared/api/orval-generated";

  type Props = {
    wardrobeItems: ModelsStrippedItem[];
    kind?: "armor" | "equipment";
  };

  let { wardrobeItems, kind = "armor" }: Props = $props();

  const armorSlots = ["helmet", "chestplate", "leggings", "boots"] as const satisfies EmptyItemSlotType[];
  const equipmentSlots = ["necklace", "cloak", "belt", "gloves"] as const satisfies EmptyItemSlotType[];
  const emptySlots = $derived(kind === "armor" ? armorSlots : equipmentSlots);
</script>

<GearSlotColumn items={wardrobeItems} {emptySlots} class="mt-2" />
