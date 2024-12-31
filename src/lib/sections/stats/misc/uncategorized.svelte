<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { format } from "numerable";

  const { misc } = getProfileCtx();
</script>

{#if misc.uncategorized != null && Object.values(misc.uncategorized).filter((value) => value).length > 0}
  <SectionSubtitle class="!uppercase">Uncategorized</SectionSubtitle>
  <Items>
    <div slot="text">
      <AdditionStat text="Soulflow" data={format(misc.uncategorized.soulflow as number, "0.00a")} />
      <AdditionStat text="Teleporter Pill Consumed" data={misc.uncategorized.teleporter_pill_consumed ? "Yes" : "No"} />
      <AdditionStat text="Soulflow" data={misc.uncategorized.reaper_peppers_eaten as number} maxed={misc.uncategorized.reaper_peppers_eaten === 5} />
      <AdditionStat text="Bank Cooldown" data={misc.uncategorized.personal_bank as number} maxed={misc.uncategorized.personal_bank === "None"} />
    </div>
  </Items>
{/if}
