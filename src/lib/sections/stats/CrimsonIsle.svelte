<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { formatTime } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import type { Stats as StatsType } from "$lib/types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const isle = profile.crimson_isle;
</script>

<Items title="Collections" class="flex-col">
  <div slot="text">
    {#if isle.factions.selectedFaction === "none"}
      {profile.username} hasn't visited the Crimson Isle yet.
    {:else}
      <AdditionStat text="Selected Faction" class="capitalize" data={isle.factions.selectedFaction} />
      <AdditionStat text="Mage Reputation" data={isle.factions.magesReputation} />
      <AdditionStat text="Barbarian Reputation" data={isle.factions.barbariansReputation} />
    {/if}
  </div>

  {#if isle.kuudra.totalKills}
    <div class="flex flex-col gap-4">
      <h3 class="text-xl font-semibold">Kuudra Completions</h3>
      <AdditionStat text="Total Completions" data={isle.kuudra.totalKills} />
      <div class="flex flex-wrap gap-4">
        {#each isle.kuudra.tiers as tier}
          {@const hasUnlocked = tier.kills}
          <Chip image={{ src: tier.texture }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}>
            <div class={cn("flex flex-col")}>
              <div class="font-bold">
                <span class="opacity-60">{tier.name}</span>
                <div class="text-sm">
                  <span class="opacity-60">Kills:</span>
                  <span class="text-text">{format(tier.kills)}</span>
                </div>
              </div>
            </div>
          </Chip>
        {/each}
      </div>
    </div>
  {/if}

  {#if isle.dojo.totalPoints}
    <div class="flex flex-col gap-4">
      <h3 class="text-xl font-semibold">Dojo Completions</h3>
      <AdditionStat text="Total Points" data={format(isle.dojo.totalPoints)} maxed={isle.dojo.totalPoints >= 7000} />
      <div class="flex flex-wrap gap-4">
        {#each isle.dojo.challenges as challenge}
          {@const hasMaxed = challenge.points >= 1000}
          {@const hasUnlocked = challenge.points}
          <Chip image={{ src: challenge.texture }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}>
            <div class={cn("flex flex-col")}>
              <div class="font-bold">
                <span class={cn(hasMaxed ? "text-maxed" : "opacity-60")}>{challenge.name}</span>
                <div class="text-sm">
                  <span class="opacity-60">Points:</span>
                  <span class="text-text">{format(challenge.points)}</span>
                </div>
                <div class="text-sm">
                  <span class="opacity-60">Rank:</span>
                  <span class="text-text">{challenge.rank}</span>
                </div>
                <div class="text-sm">
                  <span class="opacity-60">Time:</span>
                  <span class="text-text">{formatTime(challenge.time)}</span>
                </div>
              </div>
            </div>
          </Chip>
        {/each}
      </div>
    </div>
  {/if}
</Items>
