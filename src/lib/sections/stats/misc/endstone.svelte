<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { format } from "numerable";
  import { SectionSubtitle } from "#lib/components/sections/index.js";
  import { AdditionStat } from "#lib/components/stats/index.js";

  const misc = $derived(getMiscContext().misc);
</script>

{#if misc && misc.endstone_protector != null}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Endstone Protector</SectionSubtitle>
    <div class="space-y-0.5">
      {#each Object.entries(misc.endstone_protector) as [text, data], index (index)}
        <AdditionStat text={text.replaceAll("_", " ")} data={format(data)} />
      {/each}
    </div>
  </div>
{/if}
