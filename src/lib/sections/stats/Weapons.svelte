<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { renderLore } from "$lib/shared/helper";

  const { profile } = getProfileCtx();
</script>

<Items title="Weapons">
  <div slot="text">
    <!-- TODO: add colors later -->
    <p class="font-bold">
      <span class="text-text/60">Active Weapon: </span>
      {@html renderLore(profile.items.weapons.highest_priority_weapon.display_name)}
    </p>
  </div>

  {#each profile.items.weapons.weapons as weapon}
    <Item piece={weapon} />
  {/each}
</Items>
