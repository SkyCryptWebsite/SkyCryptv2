<script lang="ts">
  import { getCombinedContext } from "$ctx";
  import { Chip } from "$lib/components/misc";
  import { Section, SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { formatTime } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import SwordsIcon from "@lucide/svelte/icons/swords";
  import { format } from "numerable";

  let { order }: { order: number } = $props();

  const isle = $derived(getCombinedContext().current?.crimsonIsle);
</script>

<Section id="Crimson_Isle" {order}>
  {#if isle}
    <div class="contents space-y-4">
      {#if isle.factions}
        <div class="border p-4 rounded-xl">
          {#if isle.factions.selectedFaction}
            <AdditionStat text="Selected Faction" class="capitalize" data={isle.factions.selectedFaction} />
          {/if}
          {#if isle.factions.magesReputation != null}
            <AdditionStat text="Mage Reputation" data={format(isle.factions.magesReputation)} maxed={isle.factions.magesReputation >= 12000} />
          {/if}
          {#if isle.factions.barbariansReputation != null}
            <AdditionStat text="Barbarian Reputation" data={format(isle.factions.barbariansReputation)} maxed={isle.factions.barbariansReputation >= 12000} />
          {/if}
        </div>
      {/if}

      {#if isle.kuudra && isle.kuudra.totalKills}
        <div class="border p-4 rounded-xl">
          <SectionSubtitle class="my-0">Kuudra Completions</SectionSubtitle>
          <AdditionStat text="Total Completions" data={isle.kuudra.totalKills} />

          <ScrollAreaItems>
            {#each isle.kuudra.tiers as tier, index (index)}
              {const hasUnlocked = tier.kills}
              <Chip image={{ src: tier.texture ?? "" }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}>
                <div class="flex flex-col font-bold whitespace-nowrap">
                  <span class="opacity-60">{tier.name}</span>
                  <div class="text-sm">
                    <span class="opacity-60">Kills:</span>
                    <span class="text-foreground">{format(tier.kills)}</span>
                  </div>
                </div>
              </Chip>
            {/each}
          </ScrollAreaItems>
        </div>
      {/if}

      {#if isle.dojo && isle.dojo.totalPoints}
        <div class="border p-4 rounded-xl">
          <SectionSubtitle class="my-0">Dojo Completions</SectionSubtitle>
          <AdditionStat text="Total Points" data={format(isle.dojo.totalPoints)} maxed={isle.dojo.totalPoints >= 7000} />

          <ScrollAreaItems>
            {#each isle.dojo.challenges as challenge, index (index)}
              {const hasMaxed = (challenge.points ?? 0) >= 1000}
              {const hasUnlocked = challenge.points}
              <Chip image={{ src: challenge.texture ?? "" }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}>
                <div class="flex flex-col font-bold whitespace-nowrap">
                  <span class={cn(hasMaxed ? "text-accent-2" : "opacity-60")}>{challenge.name}</span>
                  {#if challenge.points != null}
                    <div class="text-sm">
                      <span class="opacity-60">Points:</span>
                      <span class="text-foreground">{format(challenge.points)}</span>
                    </div>
                  {/if}
                  {#if challenge.rank}
                    <div class="text-sm">
                      <span class="opacity-60">Rank:</span>
                      <span class="text-foreground">{challenge.rank}</span>
                    </div>
                  {/if}
                  {#if challenge.time}
                    <div class="text-sm">
                      <span class="opacity-60">Time:</span>
                      <span class="text-foreground">{formatTime(challenge.time)}</span>
                    </div>
                  {/if}
                </div>
              </Chip>
            {/each}
          </ScrollAreaItems>
        </div>
      {/if}
    </div>
  {:else}
    <EmptyStat title="No Data" description="This player doesn't have anything related to the Crimson Isle" icon={SwordsIcon} />
  {/if}
</Section>
