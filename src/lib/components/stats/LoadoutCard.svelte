<script lang="ts">
  import { getAllStatsContext } from "$ctx";
  import type { EmptyItemSlotType } from "$lib/components/item/EmptyItemSlot.svelte";
  import EmptyItemSlot from "$lib/components/item/EmptyItemSlot.svelte";
  import GearSlotColumn from "$lib/components/item/GearSlotColumn.svelte";
  import SkyblockItem from "$lib/components/item/Item.svelte";
  import type { ModelsResolvedLoadout } from "$lib/shared/api/orval-generated";
  import { titleCase } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import * as Item from "$ui/item";
  import { Separator } from "$ui/separator";

  type Props = {
    loadout: ModelsResolvedLoadout;
    class?: string;
  };

  const armorSlots = ["helmet", "chestplate", "leggings", "boots"] as const satisfies EmptyItemSlotType[];
  const equipmentSlots = ["necklace", "cloak", "belt", "gloves"] as const satisfies EmptyItemSlotType[];
  const tuningStatAliases = {
    attack_speed: "bonus_attack_speed",
    walk_speed: "speed"
  } as const;

  let { loadout, class: className }: Props = $props();
  const allStats = $derived(getAllStatsContext().current);

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
    return allStats.find((s) => s.id === resolvedStat);
  }

  const overview = $derived<{ label: string; value: string; icon: string; color: string }[]>([
    {
      label: "Power",
      value: powerStone,
      // Dev Note: Overbloom Icon
      icon: "",
      color: "text-minecraft-b"
    },
    {
      label: "HotM",
      value: selectedSlot(loadout.miningCoreSelectedSlot),
      // Dev Note: Mining Fortune/Pickaxe Icon
      icon: "",
      color: "text-minecraft-6"
    },
    {
      label: "HotF",
      value: selectedSlot(loadout.foragingCoreSelectedSlot),
      // Dev Note: Foraging Fortune/axe Icon
      icon: "",
      color: "text-minecraft-2"
    }
  ]);
</script>

<div
  data-slot="loadout-card"
  class={cn("w-full max-w-4xl space-y-4 overflow-clip rounded-xl border bg-background/20 p-4", className)}>
  <ScrollAreaItems orientation="horizontal" viewportClasses="scroll-fade-track-x">
    <div class="flex flex-col items-start gap-4 overflow-x-auto md:mx-auto md:w-fit md:flex-row">
      <GearSlotColumn label="Armor" items={armor} emptySlots={armorSlots} slotContainerClass="flex-row" />
      <Separator orientation="vertical" class="hidden h-25! md:block" />
      <GearSlotColumn label="Equip." items={equipment} emptySlots={equipmentSlots} slotContainerClass="flex-row" />
      <Separator orientation="vertical" class="hidden h-25! md:block" />
      <div class="flex shrink-0 flex-col gap-2">
        <span class="text-center text-xs font-semibold tracking-wide text-muted-foreground">Pet</span>
        {#if pet?.display_name}
          <SkyblockItem piece={pet} />
        {:else}
          <EmptyItemSlot slot="pet" />
        {/if}
      </div>
    </div>
  </ScrollAreaItems>

  <Separator />

  <div class="flex flex-wrap items-center gap-2">
    {#each overview as { label, value, icon, color } (label)}
      <Item.Root variant="outline" class="w-fit">
        <Item.Media variant="icon" class={cn("font-skyblock-icons", color)}>{icon}</Item.Media>
        <Item.Content>
          <Item.Title class={cn("text-sm", color)}>{label}</Item.Title>
          <Item.Description>{value}</Item.Description>
        </Item.Content>
        <Item.Actions />
      </Item.Root>
    {/each}
  </div>

  <Separator />

  <div class="space-y-2">
    <div class="text-xs font-semibold tracking-wide text-muted-foreground">Tuning Points</div>
    {#if tuningPoints.length > 0}
      <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {#each tuningPoints as [stat, amount] (stat)}
          {const statData = tuningStat(stat)}
          <div class="flex items-baseline justify-between gap-2 tabular-nums">
            <dt
              class={cn(
                "flex items-center gap-1",
                statData?.color ? `text-minecraft-${statData.color}` : "text-muted-foreground"
              )}>
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
      <p class="text-sm text-muted-foreground">None</p>
    {/if}
  </div>
</div>
