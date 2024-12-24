<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { ValidStats as StatsType } from "$lib/types/stats";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");
</script>

<Items title="Weapons">
  <div slot="text">
    <!-- TODO: add colors later -->
    <AdditionStat text="Active Weapon" data={profile.items.weapons.highest_priority_weapon.tag.display.Name} />
  </div>

  {#each profile.items.weapons.weapons as weapon}
    <Item piece={weapon} />
  {/each}
</Items>
