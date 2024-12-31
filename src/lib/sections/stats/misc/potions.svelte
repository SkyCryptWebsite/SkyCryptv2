<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { format } from "numerable";

  const { misc } = getProfileCtx();
</script>

{#if misc.effects != null && Object.values(misc.effects).reduce((acc, val) => acc + val.length, 0) > 0}
  <SectionSubtitle class="!uppercase">Potions</SectionSubtitle>
  <Items>
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
