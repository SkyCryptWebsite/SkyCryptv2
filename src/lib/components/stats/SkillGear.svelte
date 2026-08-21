<script lang="ts">
  import type { EmptyItemSlotType } from "$lib/components/item/EmptyItemSlot.svelte";
  import GearSlotColumn from "$lib/components/item/GearSlotColumn.svelte";
  import type { ModelsSkillGear } from "$lib/shared/api/orval-generated";

  type Skill = "farming" | "fishing" | "foraging" | "mining";

  type Props = {
    gear?: ModelsSkillGear;
    skill: Skill;
  };

  const armorSlots = ["helmet", "chestplate", "leggings", "boots"] as const satisfies EmptyItemSlotType[];
  const equipmentSlots = ["necklace", "cloak", "belt", "gloves"] as const satisfies EmptyItemSlotType[];
  const miscSlots = ["backpack", "backpack"] as const satisfies EmptyItemSlotType[];
  const toolSlots = {
    farming: "hoe",
    fishing: "fishing",
    foraging: "axe",
    mining: "pickaxe"
  } as const satisfies Record<Skill, EmptyItemSlotType>;

  let { gear, skill }: Props = $props();

  const armor = $derived([
    gear?.armor?.pieces?.helmet,
    gear?.armor?.pieces?.chestplate,
    gear?.armor?.pieces?.leggings,
    gear?.armor?.pieces?.boots
  ]);
  const equipment = $derived([
    gear?.equipment?.necklace,
    gear?.equipment?.cloak,
    gear?.equipment?.belt,
    gear?.equipment?.gloves
  ]);
  const tools = $derived(gear?.tools?.slice(0, 4) ?? []);
  const misc = $derived(gear?.misc?.slice(0, 2) ?? []);
  const toolEmptySlots = $derived(Array.from({ length: 4 }, () => toolSlots[skill]));
</script>

<div class="max-w-full overflow-x-auto pb-2">
  <div class="flex w-max min-w-full items-start justify-start gap-4 px-1">
    <GearSlotColumn label="Armor" items={armor} emptySlots={armorSlots} />
    <GearSlotColumn label="Equip." items={equipment} emptySlots={equipmentSlots} />
    <GearSlotColumn label="Tools" items={tools} emptySlots={toolEmptySlots} />
    <GearSlotColumn label="Misc" items={misc} emptySlots={miscSlots} />
  </div>
</div>
