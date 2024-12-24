<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { ValidStats as StatsType } from "$lib/types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

{#if misc.effects != null}
  <Items title="Potions">
    <div slot="text">
      <AdditionStat text="Disabled Potion Effects" data={format(misc.effects.disabled.length)} asterisk={true}>
        <p class="font-bold text-text/85">Disabled Potion Effects:</p>
        {#each misc.effects.disabled as effect}
          <p class="font-semibold capitalize text-text">{effect.replaceAll("_", " ")}</p>
        {/each}
      </AdditionStat>
    </div>
  </Items>
{/if}
