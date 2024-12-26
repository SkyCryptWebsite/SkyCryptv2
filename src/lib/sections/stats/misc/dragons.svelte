<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { format } from "numerable";

  const { misc } = getProfileCtx();
</script>

{#if misc.dragons != null}
  <SectionSubtitle class="!uppercase">Dragons</SectionSubtitle>
  <Items>
    <div slot="text">
      <AdditionStat text="Most Damage" data={format(misc.dragons.most_damage.best.toFixed(0))} asterisk={true}>
        {#each Object.entries(misc.dragons.most_damage) as [text, data]}
          {#if text !== "best"}
            <AdditionStat {text} data={format(data.toFixed(0))} />
          {/if}
        {/each}
      </AdditionStat>
      <AdditionStat text="Fastest Kill" data={misc.dragons.fastest_kill.best} asterisk={true}>
        {#each Object.entries(misc.dragons.fastest_kill) as [text, data]}
          {#if text !== "best"}
            <AdditionStat {text} {data} />
          {/if}
        {/each}
      </AdditionStat>
      <AdditionStat text="Last Hits" data={format(misc.dragons.last_hits.total)} asterisk={true}>
        {#each Object.entries(misc.dragons.last_hits) as [text, data]}
          {#if text !== "total"}
            <AdditionStat {text} data={format(data)} />
          {/if}
        {/each}
      </AdditionStat>
      <AdditionStat text="Deaths" data={format(misc.dragons.deaths.total)} asterisk={true}>
        {#each Object.entries(misc.dragons.deaths) as [text, data]}
          {#if text !== "total"}
            <AdditionStat {text} data={format(data)} />
          {/if}
        {/each}
      </AdditionStat>
    </div>
  </Items>
{/if}
