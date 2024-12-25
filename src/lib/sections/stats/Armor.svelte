<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import Bonus from "$lib/components/Bonus.svelte";
  import Item from "$lib/components/Item.svelte";
  import Wardrobe from "$lib/components/Wardrobe.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { getRarityClass } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";

  const { profile } = getProfileCtx();

  const armor = $derived(profile.items.armor);
  const equipment = $derived(profile.items.equipment);
  const wardrobe = $derived(profile.items.wardrobe);
  const firstWardrobeItems = $derived(wardrobe.map((wardrobeItems) => wardrobeItems.find((piece) => piece)));
</script>

<Items title="Armor">
  <div slot="text" class="contents">
    {#if armor.set_name}
      <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
        <span>Set:</span>
        <span class={cn(getRarityClass(armor.set_rarity ?? "", "text"))}>{armor.set_name}</span>
      </p>
    {/if}
  </div>
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
  {#each firstWardrobeItems as _, i}
    <Wardrobe wardrobeItems={wardrobe[i]} />
  {/each}
</Items>
