<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { ValidStats as StatsType } from "$lib/types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

{#if misc.endstone_protector != null}
  <Items title="Endstone Protector">
    <div slot="text">
      {#each Object.entries(misc.endstone_protector) as [text, data]}
        <AdditionStat text={text.replaceAll("_", " ")} data={format(data)} />
      {/each}
    </div>
  </Items>
{/if}
