<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$lib/types/stats";
  import { getContext } from "svelte";

  const profile = getContext<Promise<StatsType>>("profile");
</script>

<Items title="Weapons">
  <div slot="text">
    <!-- add colors later -->
    {#await profile}
      Loading
    {:then profile}
      <AdditionStat text="Active Weapon" data={profile.items.weapons.highest_priority_weapon.tag.display.Name} />
    {/await}
  </div>
  {#await profile}
    Loading
  {:then profile}
    {#each profile.items.weapons.weapons as weapon}
      <Item piece={weapon} />
    {/each}
  {/await}
</Items>
