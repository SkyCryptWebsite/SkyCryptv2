<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { format } from "numerable";

  const misc = $derived(getMiscContext().misc);
</script>

{#if misc && misc.profile_upgrades != null}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Upgrades</SectionSubtitle>
    <div class="space-y-0.5">
      <AdditionStat
        text="Island Size"
        data="{format(misc.profile_upgrades.island_size)} / 10"
        maxed={misc.profile_upgrades.island_size === 10} />
      <AdditionStat
        text="Minion Slots"
        data="{format(misc.profile_upgrades.minion_slots)} / 5"
        maxed={misc.profile_upgrades.minion_slots === 5} />
      <AdditionStat
        text="Guests Count"
        data="{format(misc.profile_upgrades.guests_count)} / 5"
        maxed={misc.profile_upgrades.guests_count === 5} />
      <AdditionStat
        text="Coop Slots"
        data="{format(misc.profile_upgrades.coop_slots)} / 3"
        maxed={misc.profile_upgrades.coop_slots === 3} />
      <AdditionStat
        text="Coins Allowance"
        data="{format(misc.profile_upgrades.coins_allowance)} / 5"
        maxed={misc.profile_upgrades.coins_allowance === 5} />
    </div>
  </div>
{/if}
