<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { formatDate, formatDistanceToNowStrict } from "date-fns";

  const { misc } = getProfileCtx();
</script>

{#if misc.claimed_items != null}
  <SectionSubtitle class="!uppercase">Claimed Items</SectionSubtitle>
  <Items>
    <div slot="text">
      {#each Object.entries(misc.claimed_items) as [item, time]}
        <AdditionStat
          text={item.replaceAll("_", " ")}
          data={formatDistanceToNowStrict(time, {
            addSuffix: true
          })}
          asterisk={true}>
          {formatDate(time, "'Claimed on' dd MMMM yyyy 'at' HH:mm")}
        </AdditionStat>
      {/each}
    </div>
  </Items>
{/if}
