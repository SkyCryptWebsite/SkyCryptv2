<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { format } from "numerable";

  const misc = $derived(getMiscContext().misc);
</script>

{#if misc && misc.season_of_jerry != null}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Season of Jerry</SectionSubtitle>
    <div class="space-y-0.5">
      {#each Object.entries(misc.season_of_jerry) as [text, data], index (index)}
        <AdditionStat text={text.replaceAll("_", " ")} data={format(data)} />
      {/each}
    </div>
  </div>
{/if}
