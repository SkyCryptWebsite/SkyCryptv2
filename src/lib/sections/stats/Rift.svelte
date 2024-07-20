<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const rift = profile.rift;
</script>

<Items title="Rift">
  <div slot="text">
    <AdditionStat text="Motes" data={`${format(Math.floor(rift.motes.purse))}`} asterisk={true}>
      <div class="font-bold">
        <div>
          <h3 class="text-text/85">Lifetime Motes: {format(Math.floor(rift.motes.lifetime))}</h3>
          <p class="font-medium italic text-text/80">Total Motes earned in Rift.</p>
        </div>
        <div>
          <h3 class="text-text/85">Mote Orbs: {format(rift.motes.orbs)}</h3>
          <p class="font-medium italic text-text/80">Amount of Mote Orbs player has picked up inside of the Rift.</p>
        </div>
      </div>
    </AdditionStat>
    <AdditionStat text="Enigma Souls" data={`${rift.enigma.souls} / ${rift.enigma.totalSouls}`} asterisk={true}>
      <div class="font-bold">
        <h3 class="text-text/85">Progress: 100.00%</h3>
        <p class="font-medium italic text-text/80">Precent of Enigma Souls found.</p>
      </div>
    </AdditionStat>
    <AdditionStat text="McGrubber's Burgers" data={`${rift.castle.grubberStacks} / ${rift.castle.maxBurgers}`} />
  </div>

  <Items subtitle="Porhtal">
    <div slot="text">
      <AdditionStat text="Eyes Unlocked" data={`${rift.porhtal.porhtalsFound}`} />
    </div>
    {#each rift.porhtal.porhtals as porhtal}
      <Chip name={porhtal.name} texture={porhtal.texture} noHover={true} />
    {/each}
  </Items>
  <Items subtitle="Timecharms">
    <div slot="text">
      <AdditionStat text="Timecharms Obatained" data={`${rift.timecharms.timecharmsFound}`} />
    </div>
    {#each rift.timecharms.timecharms as timecharm}
      {#if timecharm.unlocked === true}
        <Chip name={timecharm.name} texture={timecharm.texture} extra={[["Obtained", timecharm.unlockedAt]]} noHover={true} />
      {:else}
        <Chip name={timecharm.name} texture={timecharm.texture} extra={[["Not Obtained!", undefined]]} noHover={true} />
      {/if}
    {/each}
  </Items>
</Items>
