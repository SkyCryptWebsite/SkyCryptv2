<script lang="ts">
  import Bonus from "$lib/components/Bonus.svelte";
  import Item from "$lib/components/Item.svelte";
  import Wardrobe from "$lib/components/Wardrobe.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { getRarityClass } from "$lib/tools";
  import { cn } from "$lib/utils";
  import type { Stats as StatsType } from "$types/stats";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const armor = profile.items.armor;
  const equipment = profile.items.equipment;
  const wardrobe = profile.items.wardrobe;

  const firstWardrobeItems = wardrobe.map((wardrobeItems) => wardrobeItems.find((piece) => piece));
</script>

<div id="Weapons">
  <Items title="Armor">
    <p slot="text" class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
      <span>Set:</span>
      <span class={cn(getRarityClass(armor.set_rarity ?? "", "text"))}>{armor.set_name}</span>
    </p>
    {#each armor.armor as piece}
      <Item {piece} />
    {/each}
    <Bonus slot="info" stats={armor.stats} />
  </Items>

  <Items subtitle="Equipment">
    {#each equipment.equipment as piece}
      <Item {piece} />
    {/each}
    <Bonus slot="info" stats={equipment.stats} />
  </Items>

  <Items subtitle="Wardrobe">
    {#each firstWardrobeItems as firstWardrobeItem, i}
      <Wardrobe {firstWardrobeItem} wardrobeItems={wardrobe[i]} />
    {/each}
  </Items>
</div>
