<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { format } from "numerable";

  const { misc } = getProfileCtx();
</script>

{#if misc.damage != null}
  <SectionSubtitle class="!uppercase">Damage</SectionSubtitle>
  <Items>
    <div slot="text">
      {#each Object.entries(misc.damage) as [text, data]}
        <AdditionStat text={text.replaceAll("_", " ")} data={format(data.toFixed(3))} />
      {/each}
    </div>
  </Items>
{/if}
