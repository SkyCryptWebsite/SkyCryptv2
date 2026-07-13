<script lang="ts">
  import type { EmptyItemSlotType } from "$lib/components/item/EmptyItemSlot.svelte";
  import EmptyItemSlot from "$lib/components/item/EmptyItemSlot.svelte";
  import GearSlotColumn from "$lib/components/item/GearSlotColumn.svelte";
  import Item from "$lib/components/item/Item.svelte";
  import type { ModelsResolvedLoadout } from "$lib/shared/api/orval-generated";
  import { STATS_DATA } from "$lib/shared/constants/stats";
  import { titleCase } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import { Separator } from "$ui/separator";

  type Props = {
    loadout: ModelsResolvedLoadout;
    index: number;
    class?: string;
  };

  const armorSlots = ["helmet", "chestplate", "leggings", "boots"] as const satisfies EmptyItemSlotType[];
  const equipmentSlots = ["necklace", "cloak", "belt", "gloves"] as const satisfies EmptyItemSlotType[];
  const tuningStatAliases = {
    attack_speed: "bonus_attack_speed",
    walk_speed: "speed"
  } as const;

  let { loadout, index, class: className }: Props = $props();

  const name = $derived(loadout.name?.trim() || `Loadout ${index + 1}`);
  const armor = $derived(loadout.armor ?? []);
  const equipment = $derived(loadout.equipment ?? []);
  const pet = $derived(loadout.pet);
  const tuningPoints = $derived(Object.entries(loadout.accessories?.tuningPoints ?? {}));
  const powerStone = $derived(loadout.accessories?.powerStone ? titleCase(loadout.accessories.powerStone) : "None");

  function selectedSlot(value: number | undefined): string {
    return value ? value.toString() : "None";
  }

  function tuningStat(stat: string) {
    const resolvedStat = tuningStatAliases[stat as keyof typeof tuningStatAliases] ?? stat;
    return STATS_DATA[resolvedStat as keyof typeof STATS_DATA];
  }
</script>

<article data-slot="loadout-card" class={cn("space-y-4 rounded-xl border bg-background/20 p-4", className)}>
  <h4 class="text-balance font-semibold">{name}</h4>

  <div class="flex items-start gap-4 overflow-x-auto pb-1">
    <GearSlotColumn label="Armor" items={armor} emptySlots={armorSlots} />
    <GearSlotColumn label="Equip." items={equipment} emptySlots={equipmentSlots} />
    <div class="flex shrink-0 flex-col gap-2">
      <span class="text-center text-xs font-semibold tracking-wide text-foreground/60 uppercase">Pet</span>
      {#if pet?.display_name}
        <Item piece={pet} />
      {:else}
        <EmptyItemSlot slot="pet" />
      {/if}
    </div>
  </div>

  <div class="flex flex-wrap items-center gap-2 border-t pt-3">
    <div class="flex min-h-10 items-center gap-1.5 rounded-xl bg-foreground/5 px-3 text-sm">
      <span class="font-skyblock-icons text-minecraft-b">✦</span>
      <span class="text-minecraft-b">Power</span>
      <span class="font-medium">{powerStone}</span>
    </div>

    <div class="flex min-h-10 items-center gap-1.5 rounded-xl bg-foreground/5 px-3 text-sm tabular-nums">
      <span class="font-skyblock-icons text-minecraft-6">⸕</span>
      <span class="text-minecraft-6">HotM</span>
      <span class="font-medium">{selectedSlot(loadout.miningCoreSelectedSlot)}</span>
    </div>

    <div class="flex min-h-10 items-center gap-1.5 rounded-xl bg-foreground/5 px-3 text-sm tabular-nums">
      <span class="font-skyblock-icons text-minecraft-2">☘</span>
      <span class="text-minecraft-2">HotF</span>
      <span class="font-medium">{selectedSlot(loadout.foragingCoreSelectedSlot)}</span>
    </div>
  </div>

  <Separator />

  <div class="space-y-2">
    <span class="text-xs font-semibold tracking-wide text-foreground/60 uppercase">Tuning Points</span>
    {#if tuningPoints.length > 0}
      <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {#each tuningPoints as [stat, amount] (stat)}
          {const statData = tuningStat(stat)}
          <div class="flex items-baseline justify-between gap-2 tabular-nums">
            <dt class={cn("flex items-center gap-1", statData?.color ?? "text-foreground/60")}>
              {#if statData}
                <span class="font-skyblock-icons">{statData.symbol}</span>
                {statData.nameTiny}
              {:else}
                {titleCase(stat)}
              {/if}
            </dt>
            <dd class="font-medium">+{amount}{statData?.suffix ?? ""}</dd>
          </div>
        {/each}
      </dl>
    {:else}
      <p class="text-sm text-foreground/60">None</p>
    {/if}
  </div>
</article>
