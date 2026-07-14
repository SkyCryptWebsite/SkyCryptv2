<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { format } from "numerable";

  const misc = $derived(getMiscContext().misc);
</script>

{#if misc && misc.damage != null}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Damage</SectionSubtitle>
    <div class="space-y-0.5">
      {#each Object.entries(misc.damage) as [text, data], index (index)}
        <AdditionStat text={text.replaceAll("_", " ")} data={format(data.toFixed(3))} />
      {/each}
    </div>
  </div>
{/if}
