<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

<Items title="Dragons">
  <div slot="text">
    <AdditionStat text="Most Damage" data={format(misc.dragons.most_damage.best.toFixed(0))} asterisk={true}>
      {#each Object.entries(misc.dragons.most_damage) as [text, data]}
        {#if text !== "best"}
          <AdditionStat {text} data={format(data.toFixed(0))} />
        {/if}
      {/each}
    </AdditionStat>
    <AdditionStat text="Fastest Kill" data={misc.dragons.fastest_kill.best} asterisk={true}>
      {#each Object.entries(misc.dragons.fastest_kill) as [text, data]}
        {#if text !== "best"}
          <AdditionStat {text} {data} />
        {/if}
      {/each}
    </AdditionStat>
    <!-- TODO: Last Hits -->
    <AdditionStat text="Deats" data={format(misc.dragons.deaths.total)} asterisk={true}>
      {#each Object.entries(misc.dragons.deaths) as [text, data]}
        {#if text !== "total"}
          <AdditionStat {text} data={format(data)} />
        {/if}
      {/each}
    </AdditionStat>
  </div>
</Items>
