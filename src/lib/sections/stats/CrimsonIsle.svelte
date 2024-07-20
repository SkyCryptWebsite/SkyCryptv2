<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const isle = profile.crimson_isle;
</script>

<Items title="Crimson Isle">
  <div slot="text">
    <AdditionStat text="Selected Faction" data={`${isle.factions.selectedFaction}`} />
    <AdditionStat text="Mage Reputation" data={`${isle.factions.magesReputation}`} />
    <AdditionStat text="Barbarian Reputation" data={`${isle.factions.barbariansReputation}`} />
  </div>

  <Items subtitle="Kuudra Completions">
    <div slot="text">
      <AdditionStat text="Total Completions" data={`${isle.kuudra.totalKills}`} />
    </div>
    {#each isle.kuudra.tiers as type}
      <Chip name={type.name} texture={type.head} extra={[["Kills", type.kills]]} noHover={true} />
    {/each}
  </Items>
  <Items subtitle="Dojo Completions">
    <div slot="text">
      <AdditionStat text="Total Points" data={`${isle.dojo.totalPoints}`} />
    </div>
    {#each isle.dojo.challenges as challenge}
      <Chip
        name={challenge.name}
        texture={challenge.texture}
        extra={[
          ["Points", challenge.points],
          ["Rank", challenge.rank],
          ["Time", challenge.time / 1000 + " Seconds"]
        ]}
        noHover={true} />
    {/each}
  </Items>
</Items>
