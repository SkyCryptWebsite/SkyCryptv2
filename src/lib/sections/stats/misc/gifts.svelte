<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

<Items title="Gifts">
  <div slot="text">
    {#each Object.entries(misc.gifts) as [text, data]}
      <AdditionStat text={text.replaceAll("_", " ")} data={format(data)} />
    {/each}
  </div>
</Items>
