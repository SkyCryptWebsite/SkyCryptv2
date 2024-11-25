<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

<Items title="Upgrades">
  <div slot="text">
    <AdditionStat text="Island Size" data="{format(misc.profile_upgrades.island_size)} / 10" maxed={misc.profile_upgrades.island_size === 10} />
    <AdditionStat text="Minion Slots" data="{format(misc.profile_upgrades.minion_slots)} / 5" maxed={misc.profile_upgrades.minion_slots === 5} />
    <AdditionStat text="Guests Count" data="{format(misc.profile_upgrades.guests_count)} / 5" maxed={misc.profile_upgrades.guests_count === 5} />
    <AdditionStat text="Coop Slots" data="{format(misc.profile_upgrades.coop_slots)} / 3" maxed={misc.profile_upgrades.coop_slots === 3} />
    <AdditionStat text="Coins Allowance" data="{format(misc.profile_upgrades.coins_allowance)} / 5" maxed={misc.profile_upgrades.coins_allowance === 5} />
  </div>
</Items>
