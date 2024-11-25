<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

<Items title="Uncategorized">
  <div slot="text">
    {#if misc.uncategorized.soulflow}
      <AdditionStat text="Soulflow" data={format(misc.uncategorized.soulflow, "0.00a")} />
    {/if}

    {#if misc.uncategorized.teleporter_pill_consumed}
      <AdditionStat text="Teleporter Pill Consumed" data={misc.uncategorized.teleporter_pill_consumed ? "Yes" : "No"} />
    {/if}

    {#if misc.uncategorized.reaper_peppers_eaten}
      <AdditionStat text="Soulflow" data={misc.uncategorized.reaper_peppers_eaten} maxed={misc.uncategorized.reaper_peppers_eaten === 5} />
    {/if}

    {#if misc.uncategorized.personal_bank !== "Unknown"}
      <AdditionStat text="Bank Cooldown" data={misc.uncategorized.personal_bank} maxed={misc.uncategorized.personal_bank === "None"} />
    {/if}
  </div>
</Items>
