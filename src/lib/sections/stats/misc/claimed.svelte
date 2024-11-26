<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$lib/types/stats";
  import { formatDate, formatDistanceToNowStrict } from "date-fns";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

<Items title="Claimed Items">
  <div slot="text">
    {#each Object.entries(misc.claimed_items) as [item, time]}
      <AdditionStat
        text={item.replaceAll("_", " ")}
        data={formatDistanceToNowStrict(time, {
          addSuffix: true
        })}
        asterisk={true}>
        {formatDate(time, "'Claimed on' dd MMMM yyyy 'at' HH:mm")}
      </AdditionStat>
    {/each}
  </div>
</Items>
