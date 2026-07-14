<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { format } from "numerable";

  const misc = $derived(getMiscContext().misc);
</script>

{#if misc && misc.uncategorized != null && Object.values(misc.uncategorized).filter((value) => value).length > 0}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Uncategorized</SectionSubtitle>
    <div class="space-y-0.5">
      <AdditionStat text="Soulflow" data={format(misc.uncategorized.soulflow as number, "0.00a")} />
      <AdditionStat
        text="Bank Cooldown"
        data={misc.uncategorized.personal_bank as number}
        maxed={misc.uncategorized.personal_bank === "None"} />
    </div>
  </div>
{/if}
