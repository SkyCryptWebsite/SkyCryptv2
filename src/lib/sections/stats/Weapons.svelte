<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";

  const { profile } = getProfileCtx();
</script>

<Items title="Weapons">
  <div slot="text">
    <!-- TODO: add colors later -->
    <AdditionStat text="Active Weapon" data={profile.items.weapons.highest_priority_weapon.display_name} />
  </div>

  {#each profile.items.weapons.weapons as weapon}
    <Item piece={weapon} />
  {/each}
</Items>
