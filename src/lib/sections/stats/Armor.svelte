<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import Bonus from "$lib/components/Bonus.svelte";
  import Item from "$lib/components/Item.svelte";
  import Wardrobe from "$lib/components/Wardrobe.svelte";
  import type { IsHover } from "$lib/hooks/is-hover.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { getRarityClass } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import { ScrollArea } from "bits-ui";
  import { getContext } from "svelte";

  const { profile } = getProfileCtx();

  const isHover = getContext<IsHover>("isHover");

  const armor = $derived(profile.items.armor);
  const equipment = $derived(profile.items.equipment);
  const wardrobe = $derived(profile.items.wardrobe);
  const firstWardrobeItems = $derived(wardrobe.map((wardrobeItems) => wardrobeItems.find((piece) => piece)));
</script>

<Items title="Armor">
  <div slot="text" class="contents">
    {#if armor.armor.length > 0 && !armor.armor.every((piece) => !piece.display_name)}
      {#if armor.set_name}
        <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
          <span>Set:</span>
          <span class={cn(getRarityClass(armor.set_rarity ?? "", "text"))}>{armor.set_name}</span>
        </p>
      {/if}
    {/if}
  </div>

  {#if armor.armor.length > 0 && !armor.armor.every((piece) => !piece.display_name)}
    {#each armor.armor as piece}
      {#if piece.display_name}
        <Item {piece} />
      {/if}
    {/each}
  {:else}
    <p class="space-x-0.5 leading-6">{profile.username} has no armor equipped</p>
  {/if}
  <Bonus slot="info" stats={armor.stats} />
</Items>

<Items subtitle="Equipment">
  {#if equipment.equipment.length > 0}
    {#each equipment.equipment as piece}
      <Item {piece} />
    {/each}
  {:else}
    <p class="space-x-0.5 leading-6">{profile.username} has no equipment equipped</p>
  {/if}

  <Bonus slot="info" stats={equipment.stats} />
</Items>

{#if wardrobe.length > 0}
  <Items subtitle="Wardrobe">
    {#if !isHover.current}
      <div class="max-w-full">
        <!-- min height was calc by: each piece of armor was 72px with a 8px gap and scrollbar was 2.5px and some more for gap for scrollbar -->
        <ScrollArea.Root class="relative min-h-[335px]">
          <ScrollArea.Viewport>
            <ScrollArea.Content>
              <div class="flex flex-row gap-5">
                {#each firstWardrobeItems as _, i}
                  <div class="!min-h-[72px] !min-w-[72px]">
                    <Wardrobe wardrobeItems={wardrobe[i]} />
                  </div>
                {/each}
              </div>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="horizontal" class="mt-2 flex h-2.5 w-full touch-none select-none rounded-full transition-all">
            <ScrollArea.Thumb class="flex rounded-full bg-icon" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner />
        </ScrollArea.Root>
      </div>
    {:else}
      {#each firstWardrobeItems as _, i}
        <Wardrobe wardrobeItems={wardrobe[i]} />
      {/each}
    {/if}
  </Items>
{/if}
