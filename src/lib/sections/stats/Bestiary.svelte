<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const bestiary = profile.bestiary;
</script>

<Items title="Bestiary">
  <div slot="text">
    <AdditionStat text="Bestiary Level" data={`${bestiary.milestone / 10} / ${bestiary.maxMilestone / 10}`} />
    <AdditionStat text="Families Unlocked" data={`${bestiary.familiesUnlocked} / ${bestiary.totalFamilies}`} />
    <AdditionStat text="Families Completed" data={`${bestiary.familiesMaxed} / ${bestiary.totalFamilies}`} />
  </div>

  {#each Object.entries(bestiary.categories) as [_, category]}
    {@const max = category.mobsMaxed === category.mobs.length ? "MAX!" : `(${category.mobsMaxed} / ${category.mobs.length} MAX)`}
    <Items subtitle={category.name + " " + max}>
      {#each category.mobs as mob}
        <Chip name={mob.name} tier={mob.tier ?? 0} texture={mob.texture} extra={[["Kills", mob.kills]]}>
          {#if mob.kills >= mob.maxKills}
            <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
              <p>Progress: max!</p>
            </div>
          {:else}
            <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
              <p>Progress to Tier {mob.tier}: {mob.kills} / {mob.nextTierKills}</p>
              <p />
              <p>Overall Progress: {mob.kills} / {mob.maxKills}</p>
            </div>
          {/if}
        </Chip>
      {/each}
    </Items>
  {/each}
</Items>
