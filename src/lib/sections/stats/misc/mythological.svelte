<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { RARITY_COLORS } from "$lib/shared/constants/rarities";
  import { Label } from "$ui/label";
  import { format } from "numerable";

  const misc = $derived(getMiscContext().misc);
</script>

{#if misc && misc.mythological_event != null}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Mythological Event</SectionSubtitle>
    <div class="space-y-0.5">
      {#if misc.mythological_event.kills}
        <AdditionStat text="Kills" data={format(misc.mythological_event.kills)} />
      {/if}

      {#if misc.mythological_event.burrows_dug_next?.total}
        <AdditionStat text="Dug Arrows" data={format(misc.mythological_event.burrows_dug_next.total)} asterisk={true}>
          <Label>Rarities used:</Label>
          {#each Object.entries(misc.mythological_event.burrows_dug_next) as [tier, count], index (index)}
            {#if tier !== "total"}
              <Label class="gap-1 capitalize">
                <span style="color: var(--§{RARITY_COLORS[tier.toLowerCase()]})"
                  >{tier.replaceAll("_", " ").toLowerCase()}:</span>
                <span class="font-bold">{format(count)}</span>
              </Label>
            {/if}
          {/each}
        </AdditionStat>
      {/if}

      {#if misc.mythological_event.burrows_dug_combat?.total}
        <AdditionStat
          text="Dug Monsters"
          data={format(misc.mythological_event.burrows_dug_combat.total)}
          asterisk={true}>
          <Label>Rarities used:</Label>
          {#each Object.entries(misc.mythological_event.burrows_dug_combat) as [tier, count], index (index)}
            {#if tier !== "total"}
              <Label class="gap-1 capitalize">
                <span style="color: var(--§{RARITY_COLORS[tier.toLowerCase()]})"
                  >{tier.replaceAll("_", " ").toLowerCase()}:</span>
                <span class="font-bold">{format(count)}</span>
              </Label>
            {/if}
          {/each}
        </AdditionStat>
      {/if}

      {#if misc.mythological_event.burrows_dug_treasure?.total}
        <AdditionStat
          text="Dug Treasure"
          data={format(misc.mythological_event.burrows_dug_treasure.total)}
          asterisk={true}>
          <Label>Rarities used:</Label>
          {#each Object.entries(misc.mythological_event.burrows_dug_treasure) as [tier, count], index (index)}
            {#if tier !== "total"}
              <Label class="gap-1 capitalize">
                <span style="color: var(--§{RARITY_COLORS[tier.toLowerCase()]})"
                  >{tier.replaceAll("_", " ").toLowerCase()}:</span>
                <span class="font-bold">{format(count)}</span>
              </Label>
            {/if}
          {/each}
        </AdditionStat>
      {/if}

      {#if misc.mythological_event.burrows_chains_complete?.total}
        <AdditionStat
          text="Chains Completed"
          data={format(misc.mythological_event.burrows_chains_complete.total)}
          asterisk={true}>
          <Label>Rarities used:</Label>
          {#each Object.entries(misc.mythological_event.burrows_chains_complete) as [tier, count], index (index)}
            {#if tier !== "total"}
              <Label class="gap-1 capitalize">
                <span style="color: var(--§{RARITY_COLORS[tier.toLowerCase()]})"
                  >{tier.replaceAll("_", " ").toLowerCase()}:</span>
                <span class="font-bold">{format(count)}</span>
              </Label>
            {/if}
          {/each}
        </AdditionStat>
      {/if}
    </div>
  </div>
{/if}
