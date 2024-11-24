<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { cn } from "$lib/utils";
  import type { Stats as StatsType } from "$types/stats";
  import { formatDate, formatDistanceToNowStrict } from "date-fns";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const rift = profile.rift;
</script>

<Items title="Rift" class="flex-col">
  <div slot="text">
    <AdditionStat text="Motes" data={rift.motes.purse} asterisk={true}>
      <div class="flex flex-col gap-4">
        <div class="text-sm font-bold">
          <span class="text-text/85">Lifetime Motes:</span>
          <span class="text-text">
            {rift.motes.lifetime}
          </span>
          <span class="block font-normal">Total Motes earned in Rift.</span>
        </div>
        <div class="text-sm font-bold">
          <span class="text-text/85">Motes Orbs:</span>
          <span class="text-text">
            {rift.motes.orbs}
          </span>
          <span class="block font-normal">Amount of Mote Orbs player has picked up inside of the Rift.</span>
        </div>
      </div>
    </AdditionStat>
    <AdditionStat text="Enigma Souls" data="{rift.enigma.souls} / {rift.enigma.totalSouls}" maxed={rift.enigma.souls === rift.enigma.totalSouls} asterisk={true}>
      <div class="text-sm font-bold">
        <span class="text-text/85">Progress:</span>
        <span class="text-text">
          {((rift.enigma.souls / rift.enigma.totalSouls) * 100).toFixed(2)}%
        </span>
        <span class="block font-normal"> Percentage of Enigma Souls found. </span>
      </div>
    </AdditionStat>
    <AdditionStat text="McGrubber's Burgers" data="{rift.castle.grubberStacks} / {rift.castle.maxBurgers}" maxed={rift.castle.grubberStacks === rift.castle.maxBurgers} />
  </div>
  <div class="space-y-4">
    <h3 class="text-xl font-semibold">Timecharms</h3>
    <AdditionStat text="Timecharms Obtained" data={rift.timecharms.timecharmsFound} maxed={rift.timecharms.timecharmsFound === 7} />
    <div class="flex flex-wrap gap-4">
      {#each rift.timecharms.timecharms as timecharm}
        {@const hasUnlocked = timecharm.unlocked}
        <Chip image={{ src: timecharm.texture }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })} variant="tooltip">
          <div class={cn("flex flex-col")}>
            <div class="font-bold">
              <span class="opacity-60">{timecharm.name}</span>
              <div class="text-sm">
                {#if hasUnlocked}
                  <span class="opacity-60">
                    Obtained {formatDistanceToNowStrict(timecharm.unlockedAt, {
                      addSuffix: true
                    })}
                  </span>
                {:else}
                  <span class="opacity-60">Not Obtained</span>
                {/if}
              </div>
            </div>
          </div>
          <div slot="tooltip" class="text-sm font-bold">
            <div>
              <span class="opacity-85">Obtained:</span>
              <span class="text-text">
                {formatDate(timecharm.unlockedAt, "dd MMMM yyyy 'at' HH:mm")}
              </span>
            </div>
          </div>
        </Chip>
      {/each}
    </div>
  </div>
</Items>
