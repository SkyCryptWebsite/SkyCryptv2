<script lang="ts">
  import { getCombinedContext } from "$ctx";
  import EmptyStat from "$lib/components/EmptyStat.svelte";
  import { EmptyItemSlot, Item } from "$lib/components/item";
  import { Wardrobe } from "$lib/components/misc";
  import { Section } from "$lib/components/sections";
  import { Bonus, Loadouts } from "$lib/components/stats";
  import { getRarityClass, renderLore } from "$lib/shared/helper";
  import { animateObfuscatedText } from "$lib/shared/mc-text/obfuscated";
  import { cn } from "$lib/shared/utils";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import SectionSubtitle from "$src/lib/components/sections/SectionSubtitle.svelte";
  import { getAllStats } from "$src/lib/shared/api/skycrypt-api.remote";
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import ShirtIcon from "@lucide/svelte/icons/shirt";
  import SwordIcon from "@lucide/svelte/icons/sword";

  let { order }: { order: number } = $props();

  const gear = $derived(getCombinedContext().current?.gear);
  const armor = $derived(gear?.armor);
  const equipment = $derived(gear?.equipment);
  const wardrobe = $derived(gear?.wardrobe);
  const equipmentWardrobe = $derived(gear?.equipmentWardrobe);
  const weapons = $derived(gear?.weapons);
  const loadouts = $derived(getCombinedContext().current?.loadouts ?? []);
  const allStats = await getAllStats();
  const armorSlots = ["helmet", "chestplate", "leggings", "boots"] as const;
  const firstWardrobeItems = $derived.by(() => {
    if (wardrobe?.length === 0) return [];
    return wardrobe?.map((wardrobeItems) => wardrobeItems.find((piece) => piece));
  });
  const firstEquipmentWardrobeItems = $derived.by(() => {
    if (equipmentWardrobe?.length === 0) return [];
    return equipmentWardrobe?.map((wardrobeItems) => wardrobeItems.find((piece) => piece));
  });
</script>

<Section id="Gear" {order} class="contents space-y-4">
  {#if armor && armor.armor}
    <div class="rounded-xl border p-4">
      <SectionSubtitle>Armor</SectionSubtitle>
      {#if armor && armor.armor}
        {#if armor.armor.length > 0 && !armor.armor.every((piece) => !piece.display_name)}
          {#if armor.set_name}
            <p class="space-x-0.5 leading-6 font-bold text-muted-foreground capitalize">
              <span>Set:</span>
              <span class={cn(getRarityClass(armor.set_rarity ?? "", "text"))}>{armor.set_name}</span>
            </p>
          {/if}
        {/if}
      {/if}

      {#if armor.stats}
        <Bonus stats={armor.stats} />
      {/if}

      {#if armor.armor.length > 0 && !armor.armor.every((piece) => !piece.display_name)}
        <ScrollAreaItems>
          {#each armor.armor as piece, index (index)}
            {#if piece && piece.display_name}
              <Item {piece} />
            {:else}
              <EmptyItemSlot slot={armorSlots[index] ?? "helmet"} />
            {/if}
          {/each}
        </ScrollAreaItems>
      {:else}
        <EmptyStat title="No Armor" description="This player has no armor equipped" icon={ShirtIcon} class="mt-2" />
      {/if}
    </div>
  {/if}

  {#if equipment}
    <div class="rounded-xl border p-4">
      <SectionSubtitle>Equipment</SectionSubtitle>
      {#if equipment.stats}
        <Bonus stats={equipment.stats} />
      {/if}
      {#if equipment.equipment && equipment.equipment.length > 0}
        <ScrollAreaItems>
          {#each equipment.equipment as piece, index (index)}
            <Item {piece} />
          {/each}
        </ScrollAreaItems>
      {:else}
        <EmptyStat
          title="No Equipment"
          description="This player has no equipment equipped"
          icon={ShieldIcon}
          class="mt-2" />
      {/if}
    </div>
  {/if}

  {#if loadouts.length > 0}
    <div class="space-y-4 rounded-xl border p-4">
      <SectionSubtitle>Loadouts</SectionSubtitle>
      <Loadouts {loadouts} {allStats} />
    </div>
  {/if}

  {#if wardrobe && wardrobe.length > 0}
    <div class="rounded-xl border p-4">
      <SectionSubtitle>Wardrobe</SectionSubtitle>
      <div class="max-w-full">
        <ScrollAreaItems
          class="relative w-full"
          viewportClasses="min-h-86 scroll-fade-track-x"
          orientation="horizontal">
          <div class="relative flex flex-row gap-6 md:gap-3">
            {#each firstWardrobeItems as _, i (i)}
              <div class="min-h-18 min-w-18">
                <Wardrobe wardrobeItems={wardrobe[i]} />
              </div>
            {/each}
            <div
              class="pointer-events-none sticky -right-2 z-10 -ml-42 h-82 w-36 self-stretch bg-linear-to-l from-background/80 to-transparent scroll-fade-x blur-xs md:-ml-39">
            </div>
          </div>
        </ScrollAreaItems>
      </div>
    </div>
  {/if}

  {#if equipmentWardrobe && equipmentWardrobe.length > 0}
    <div class="rounded-xl border p-4">
      <SectionSubtitle>Equipment Wardrobe</SectionSubtitle>
      <div class="max-w-full">
        <ScrollAreaItems
          class="relative w-full"
          viewportClasses="min-h-86 scroll-fade-track-x"
          orientation="horizontal">
          <div class="relative flex flex-row gap-6 md:gap-3">
            {#each firstEquipmentWardrobeItems as _, i (i)}
              <div class="min-h-18 min-w-18">
                <Wardrobe wardrobeItems={equipmentWardrobe[i]} kind="equipment" />
              </div>
            {/each}
            <div
              class="pointer-events-none sticky -right-2 z-10 -ml-42 h-82 w-36 self-stretch bg-linear-to-l from-background/80 to-transparent scroll-fade-x blur-xs md:-ml-39">
            </div>
          </div>
        </ScrollAreaItems>
      </div>
    </div>
  {/if}

  {#if weapons}
    <div class="rounded-xl border p-4">
      <SectionSubtitle>Weapons</SectionSubtitle>

      {#if weapons.weapons && weapons.weapons.length}
        <div>
          {#if weapons.highest_priority_weapon?.display_name}
            <p class="font-bold" {@attach animateObfuscatedText}>
              <span class="text-muted-foreground">Active Weapon: </span>
              {@html renderLore(weapons.highest_priority_weapon.display_name)}
            </p>
          {/if}
        </div>
      {:else}
        <EmptyStat title="No Weapons" description="This player has no weapons" icon={SwordIcon} class="mt-2" />
      {/if}

      {#if weapons.weapons && weapons.weapons.length}
        <ScrollAreaItems>
          {#each weapons.weapons as weapon, index (index)}
            <Item piece={weapon} />
          {/each}
        </ScrollAreaItems>
      {/if}
    </div>
  {/if}
</Section>
