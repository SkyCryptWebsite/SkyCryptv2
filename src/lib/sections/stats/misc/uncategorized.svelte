<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { format } from "numerable";

  const { misc } = getProfileCtx();
</script>

{#if misc.uncategorized != null}
  <SectionSubtitle class="!uppercase">Uncategorized</SectionSubtitle>
  <Items>
    <div slot="text">
      {#if misc.uncategorized.soulflow}
        <AdditionStat text="Soulflow" data={format(misc.uncategorized.soulflow as number, "0.00a")} />
      {/if}

      {#if misc.uncategorized.teleporter_pill_consumed}
        <AdditionStat text="Teleporter Pill Consumed" data={misc.uncategorized.teleporter_pill_consumed ? "Yes" : "No"} />
      {/if}

      {#if misc.uncategorized.reaper_peppers_eaten}
        <AdditionStat text="Soulflow" data={misc.uncategorized.reaper_peppers_eaten as number} maxed={misc.uncategorized.reaper_peppers_eaten === 5} />
      {/if}

      {#if misc.uncategorized.personal_bank !== "Unknown"}
        <AdditionStat text="Bank Cooldown" data={misc.uncategorized.personal_bank as number} maxed={misc.uncategorized.personal_bank === "None"} />
      {/if}
    </div>
  </Items>
{/if}
