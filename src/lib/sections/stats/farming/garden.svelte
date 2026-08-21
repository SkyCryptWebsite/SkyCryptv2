<script lang="ts">
  import { getProfileContext } from "$ctx";
  import { Chip } from "$lib/components/misc";
  import { SectionBoundary, SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat, GardenPlotGrid } from "$lib/components/stats";
  import { type ModelsGarden } from "$lib/shared/api/orval-generated";
  import { getGardenStats } from "$lib/shared/api/skycrypt-api.remote";
  import { formatNumber, getRarityClass } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import CollapsibleCustomTrigger from "$src/lib/components/CollapsibleCustomTrigger.svelte";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import * as Collapsible from "$ui/collapsible";
  import { Label } from "$ui/label";
  import { Progress } from "$ui/progress";
  import { Separator } from "$ui/separator";
  import LockIcon from "@lucide/svelte/icons/lock";
  import { format } from "numerable";
  import { getCurrentTabContext } from "../skills/current-tab-context.svelte";
  import { TabNamesEnum } from "../types";

  const currentTabContext = getCurrentTabContext();
  const profile = $derived(getProfileContext().current);
  const profileId = $derived(profile?.profile_id);
  const gardenLocked = $derived((profile?.skyblock_level?.level ?? 0) <= 5);
  let sectionOpen: boolean = $derived(currentTabContext.current === TabNamesEnum.Farming);
</script>

<Collapsible.Root bind:open={sectionOpen} class="mt-4 rounded-xl border p-2">
  <CollapsibleCustomTrigger>Garden</CollapsibleCustomTrigger>

  <Collapsible.Content>
    {#if gardenLocked}
      <EmptyStat
        title="Locked"
        description="This player does not have the Garden unlocked"
        icon={LockIcon}
        class="mb-2" />
    {:else if sectionOpen}
      <SectionBoundary query={() => getGardenStats({ uuid: profile?.uuid ?? "", profileId: profileId! })}>
        {#snippet children(garden)}
          {#if garden}
            {const hasMaxed = $derived(garden.level?.maxed ?? false)}

            <AdditionStat
              text="Level"
              data="{garden.level?.level} / {garden.level?.maxLevel}"
              maxed={hasMaxed}
              asterisk={true}>
              <Label>
                XP:
                <span class="text-bold">
                  {format(garden.level?.xp)}
                </span>
              </Label>
              <Separator />
              <div class="group relative space-y-2" data-maxed={hasMaxed}>
                <Label>Progress to next level:</Label>
                <div>
                  <span class="font-bold"
                    >{formatNumber(garden.level?.xpCurrent ?? 0)} / {formatNumber(garden.level?.xpForNext ?? 0)}</span>
                  XP
                </div>
                <Progress
                  value={garden.level?.xpCurrent}
                  max={hasMaxed ? garden.level?.xpCurrent : garden.level?.xpForNext}
                  class="h-4 w-full overflow-hidden rounded-full bg-foreground/30 [&>div]:rounded-full [&>div]:group-data-[maxed=false]:bg-primary [&>div]:group-data-[maxed=true]:bg-accent-3" />
              </div>
            </AdditionStat>
            <AdditionStat
              text="Composter"
              data={Object.values(garden.composter ?? {}).join(" / ")}
              asterisk={true}
              maxed={Object.values(garden.composter ?? {}).every((value) => value === 25)}>
              {#each Object.entries(garden.composter ?? {}) as [key, value], index (index)}
                <Label>
                  <span class="capitalize">{key.replaceAll("_", " ")}:</span>
                  <span class="font-bold">
                    {value}
                  </span>
                </Label>
              {/each}
            </AdditionStat>
            <AdditionStat text="Visitors" data={format(garden.visitors?.completed)} asterisk={true}>
              {#each Object.entries(garden.visitors?.visitors ?? {}) as [key, value], index (index)}
                <Label>
                  <span class={cn("capitalize", getRarityClass(key, "text"))}>{key.toLowerCase()}:</span>
                  <span class="font-bold">
                    {format(value.completed)}
                  </span>
                </Label>
              {/each}
            </AdditionStat>
            <AdditionStat text="Unique Visitors" data={garden.visitors?.uniqueVisitors ?? 0} asterisk={true}>
              {#each Object.entries(garden.visitors?.visitors ?? {}) as [key, value], index (index)}
                <Label>
                  <span class={cn("capitalize", getRarityClass(key, "text"))}>{key.toLowerCase()}:</span>
                  <span class="font-bold">
                    {format(value.unique)}
                  </span>
                </Label>
              {/each}
            </AdditionStat>
            <AdditionStat
              text="DNA Analysis Milestone"
              data="{garden.dnaAnalysisMilestone?.level} / {garden.dnaAnalysisMilestone?.maxLevel}"
              maxed={garden.dnaAnalysisMilestone?.level === garden.dnaAnalysisMilestone?.maxLevel} />

            {#if garden.gardenUpgrades}
              <Separator class="my-4" />
              <div class="px-5">
                <SectionSubtitle>Garden Upgrades</SectionSubtitle>
                <ScrollAreaItems>
                  {#each garden.gardenUpgrades as gardenUpgrade, index (index)}
                    {const hasUnlocked = gardenUpgrade.level}
                    <Chip
                      class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}
                      image={{ src: gardenUpgrade.texture ?? "" }}>
                      <div class="flex flex-col">
                        <div class="font-bold whitespace-nowrap">
                          <span class="capitalize opacity-60">{gardenUpgrade.name}</span>
                          <div class="text-sm">
                            <span class="opacity-60">Level:</span>
                            <span class="text-foreground">{format(gardenUpgrade.level)}</span>
                          </div>
                        </div>
                      </div>
                    </Chip>
                  {/each}
                </ScrollAreaItems>
              </div>
            {/if}

            {#if garden.gardenChips != null}
              <Separator class="my-4" />
              <div class="px-5">
                <SectionSubtitle>Garden Chips</SectionSubtitle>
                <ScrollAreaItems>
                  {#each garden.gardenChips as gardenChip, index (index)}
                    {const hasUnlocked = gardenChip.amount}
                    {const hasMaxed = (gardenChip.amount ?? 0) >= (gardenChip.maxLevel ?? 0)}
                    <Chip
                      class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}
                      image={{ src: gardenChip.texture ?? "" }}>
                      <div class="flex flex-col">
                        <div class="font-bold whitespace-nowrap">
                          <span class={cn("capitalize", hasMaxed ? "text-accent-2" : "opacity-60")}
                            >{gardenChip.name}</span>
                          <div class={cn("text-sm", hasMaxed ? "text-accent-4" : "text-foreground")}>
                            <span class="opacity-60">Level:</span>
                            {format(gardenChip.amount)}/{gardenChip.maxLevel}
                          </div>
                        </div>
                      </div>
                    </Chip>
                  {/each}
                </ScrollAreaItems>
              </div>
            {/if}

            {#if garden.mutations != null}
              <Separator class="my-4" />

              <div class="px-5">
                <SectionSubtitle>Mutations</SectionSubtitle>
                <ScrollAreaItems>
                  {#each garden.mutations as mutation, index (index)}
                    {const hasUnlocked = mutation.unlocked}
                    {const hasMaxed = mutation.max}
                    <Chip
                      class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}
                      image={{ src: mutation.texture ?? "" }}>
                      <div class="flex flex-col">
                        <div class="font-bold whitespace-nowrap">
                          <span class={cn("capitalize", hasMaxed ? "text-accent-2" : "opacity-60")}
                            >{mutation.name}</span>
                        </div>
                      </div>
                    </Chip>
                  {/each}
                </ScrollAreaItems>
              </div>
            {/if}

            <Separator class="my-4" />
            <div class="px-5">
              {@render milestones(garden)}
            </div>
            <Separator class="my-4" />

            <div class="px-5">
              {@render upgrades(garden)}
            </div>
            <Separator class="my-4" />

            <div class="px-5">
              <GardenPlotGrid plot={garden.plot} />
            </div>
          {/if}
        {/snippet}
      </SectionBoundary>
    {/if}
  </Collapsible.Content>
</Collapsible.Root>

{#snippet upgrades(garden: ModelsGarden)}
  {#if garden.cropUpgrades}
    {const allMaxed = Object.values(garden.cropUpgrades).every((upgrade) => upgrade.level?.maxed)}
    <div class="mb-3 flex items-center gap-1 text-base font-semibold">
      <SectionSubtitle>Crop Upgrades</SectionSubtitle>

      {#if allMaxed}
        <span class="text-accent-4">Max!</span>
      {:else}
        <span class="text-foreground/80"
          >({Object.values(garden.cropUpgrades).filter((upgrade) => upgrade.level?.maxed).length} / {Object.values(
            garden.cropUpgrades
          ).length} max)</span>
      {/if}
    </div>
    <ScrollAreaItems>
      {#each garden.cropUpgrades as upgrade, index (index)}
        {const hasMaxed = upgrade.level?.maxed}
        <Chip image={{ src: upgrade.texture ?? "" }} class={cn("h-fit w-fit", { "opacity-50": !upgrade.level?.level })}>
          <div class="flex flex-col">
            <div class="font-bold whitespace-nowrap">
              <span class={cn(hasMaxed ? "text-accent-2" : "opacity-60")}>{upgrade.name}</span>
              <span class={cn({ "text-accent-4": hasMaxed })}>{upgrade.level?.level}</span>
            </div>
          </div>
        </Chip>
      {/each}
    </ScrollAreaItems>
  {/if}
{/snippet}

{#snippet milestones(garden: ModelsGarden)}
  {#if garden.cropMilestones}
    {const allMaxed = Object.values(garden.cropMilestones).every((upgrade) => upgrade.level?.maxed)}
    <div class="flex items-center gap-1 text-base font-semibold">
      <SectionSubtitle>Milestones</SectionSubtitle>

      {#if allMaxed}
        <span class="text-accent-4">Max!</span>
      {:else if garden.cropUpgrades}
        <span class="text-foreground/80"
          >({Object.values(garden.cropMilestones).filter((upgrade) => upgrade.level?.maxed).length} / {Object.values(
            garden.cropUpgrades
          ).length} max)</span>
      {/if}
    </div>
    <ScrollAreaItems>
      {#each garden.cropMilestones as milestone, index (index)}
        {const hasMaxed = milestone.level?.maxed}
        <Chip
          image={{ src: milestone.texture ?? "" }}
          class={cn("h-fit w-fit flex-col overflow-clip pb-0", { "opacity-50": !milestone.level?.xp })}>
          <div class="flex flex-col">
            <div class="font-bold whitespace-nowrap">
              <span class={cn(hasMaxed ? "text-accent-2" : "opacity-60")}>{milestone.name}</span>
              <span class={cn({ "text-accent-4": hasMaxed })}>{milestone.level?.level}</span>
            </div>
          </div>

          {#snippet progress()}
            <div class="group relative w-full" data-maxed={hasMaxed}>
              <Progress
                value={milestone.level?.xpCurrent}
                max={hasMaxed ? milestone.level?.xpCurrent : milestone.level?.xpForNext}
                class="h-4 w-full overflow-hidden rounded-none bg-foreground/30 [&>div]:rounded-none [&>div]:group-data-[maxed=false]:bg-primary [&>div]:group-data-[maxed=true]:bg-accent-3" />
              <div
                class="absolute inset-0 bottom-0 flex w-full flex-nowrap items-center-safe justify-center-safe gap-0.5 text-xs font-bold text-nowrap">
                {formatNumber(milestone.level?.xpCurrent ?? 0)} / {formatNumber(milestone.level?.xpForNext ?? 0)} XP
              </div>
            </div>
          {/snippet}
        </Chip>
      {/each}
    </ScrollAreaItems>
  {/if}
{/snippet}
