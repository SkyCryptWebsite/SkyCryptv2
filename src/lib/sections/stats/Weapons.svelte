<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const weapons = profile.items.weapons;
</script>

<Items title="Weapons">
  <div slot="text">
    <!-- add colors later -->
    <AdditionStat text="Active Weapon" data={weapons.highest_priority_weapon.tag.display.Name} />
  </div>
  {#each weapons.weapons as weapon}
    <Item piece={weapon} />
  {/each}
</Items>
