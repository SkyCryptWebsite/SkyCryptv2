<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { format } from "numerable";

  const { misc } = getProfileCtx();
</script>

{#if misc.mythological_event != null}
  <SectionSubtitle class="!uppercase">Mythological Event</SectionSubtitle>
  <Items>
    <div slot="text">
      <AdditionStat text="Kills" data={format(misc.mythological_event.kills)} />

      <AdditionStat text="Dug Arrows" data={format(misc.mythological_event.burrows_dug_next.total)} asterisk={true}>
        <p class="font-bold text-text/85">Rarities used:</p>
        {#each Object.entries(misc.mythological_event.burrows_dug_next) as [tier, count]}
          {#if tier !== "total"}
            <AdditionStat text={tier} data={format(count)} textRarityColor={tier.toLowerCase()} />
          {/if}
        {/each}
      </AdditionStat>

      <AdditionStat text="Dug Monsters" data={format(misc.mythological_event.burrows_dug_combat.total)} asterisk={true}>
        <p class="font-bold text-text/85">Rarities used:</p>
        {#each Object.entries(misc.mythological_event.burrows_dug_combat) as [tier, count]}
          {#if tier !== "total"}
            <AdditionStat text={tier} data={format(count)} textRarityColor={tier.toLowerCase()} />
          {/if}
        {/each}
      </AdditionStat>

      <AdditionStat text="Dug Treasure" data={format(misc.mythological_event.burrows_dug_treasure.total)} asterisk={true}>
        <p class="font-bold text-text/85">Rarities used:</p>
        {#each Object.entries(misc.mythological_event.burrows_dug_treasure) as [tier, count]}
          {#if tier !== "total"}
            <AdditionStat text={tier} data={format(count)} textRarityColor={tier.toLowerCase()} />
          {/if}
        {/each}
      </AdditionStat>

      <AdditionStat text="Chains Completed" data={format(misc.mythological_event.burrows_chains_complete.total)} asterisk={true}>
        <p class="font-bold text-text/85">Rarities used:</p>
        {#each Object.entries(misc.mythological_event.burrows_chains_complete) as [tier, count]}
          {#if tier !== "total"}
            <AdditionStat text={tier} data={format(count)} textRarityColor={tier.toLowerCase()} />
          {/if}
        {/each}
      </AdditionStat>
    </div>
  </Items>
{/if}
