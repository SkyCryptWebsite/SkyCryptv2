<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import SectionTitle from "$lib/components/SectionTitle.svelte";
  import Skillbar from "$lib/components/Skillbar.svelte";
  import { formatNumber } from "$lib/shared/helper";
  import { Avatar, Collapsible } from "bits-ui";
  import { formatDate, formatDistanceToNowStrict } from "date-fns";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import Image from "lucide-svelte/icons/image";
  import { format } from "numerable";

  const { profile } = getProfileCtx();
  const dungeons = $derived(profile.dungeons);
</script>

<div class="space-y-4">
  <SectionTitle>Dungeons</SectionTitle>
  {#if dungeons.unlocked === false}
    <p class="space-x-0.5 leading-6">{profile.username} hasn't unlocked Dungeons yet.</p>
  {:else if dungeons}
    <div class="flex flex-col flex-wrap justify-start gap-x-4 gap-y-2 pt-4 sm:flex-row">
      <Skillbar class="" skill="Catacombs" skillData={dungeons.level} />
      {#each Object.entries(dungeons.classes.classes) as [className, classData]}
        <Skillbar class="sm:last:grow sm:last:basis-1/3" skill={className} skillData={classData} />
      {/each}
    </div>
    <div class="pb-1 pt-2">
      <AdditionStat text="Selected Class" data={dungeons.classes.selectedClass} />
      <AdditionStat text="Class Average" data={format(dungeons.classes.classAverage)} asterisk={true} maxed={dungeons.classes.classAverage >= 50}>
        <div class="max-w-xs space-y-2 font-bold">
          <div>
            <h3 class="text-text/85">Total Class XP: {format(dungeons.classes.totalClassExp.toFixed(2))}</h3>
            <p class="font-medium italic text-text/80">Total Class XP gained in Catacombs.</p>
          </div>
          <div>
            <h3 class="text-text/85">Average Level: {format(dungeons.classes.classAverageWithProgress.toFixed(2))}</h3>
            <p class="font-medium italic text-text/80">Average class level, includes progress to next level.</p>
          </div>
          <div>
            <h3 class="text-text/85">Average Level without progress: {format(dungeons.classes.classAverage.toFixed(2))}</h3>
            <p class="font-medium italic text-text/80">Average class level without including partial level progress.</p>
          </div>
        </div>
      </AdditionStat>
      <AdditionStat text="Highest Floor Beaten (Normal)" data={format(dungeons.stats.highestFloorBeatenNormal)} maxed={dungeons.stats.highestFloorBeatenNormal === 7} />
      <AdditionStat text="Highest Floor Beaten (Master)" data={format(dungeons.stats.highestFloorBeatenMaster)} maxed={dungeons.stats.highestFloorBeatenMaster === 7} />
      <AdditionStat text="Secrets Found" data={format(dungeons.stats.secrets.found)} subData="({format(dungeons.stats.secrets.secretsPerRun.toFixed(2))} S/R)" />
    </div>
    <div>
      <h4 class="my-5 text-xl font-semibold capitalize text-text/90">Catacombs</h4>
      <div class="flex flex-wrap gap-5">
        {#if dungeons.catacombs}
          {#each dungeons.catacombs as catacomb}
            <div class="flex min-w-80 basis-[calc((100%/3)-1.25rem)] flex-col gap-1 rounded-lg bg-background/30">
              <div class="flex w-full items-center justify-center gap-1.5 border-b-2 border-icon py-2 text-center font-semibold uppercase">
                <Avatar.Root>
                  <Avatar.Image loading="lazy" src={catacomb.texture} class="size-8 object-contain" />
                  <Avatar.Fallback>
                    <Image class="size-8" />
                  </Avatar.Fallback>
                </Avatar.Root>
                {catacomb.name}
              </div>

              <Collapsible.Root class="p-5">
                <Collapsible.Trigger class="group flex items-center gap-0.5">
                  <ChevronDown class="size-5 transition-all duration-300 group-data-[state=open]:-rotate-180" />
                  <SectionSubtitle class="my-0">Floor Stats</SectionSubtitle>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  {#each Object.entries(catacomb.stats) as [key, value]}
                    {#if typeof value === "object"}
                      <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={formatNumber(value.damage)} subData="({value.type})" />
                    {:else}
                      <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={formatNumber(value)} />
                    {/if}
                  {/each}
                </Collapsible.Content>
              </Collapsible.Root>

              {#if catacomb.best_run}
                <Collapsible.Root class="px-5 pb-[2.5rem]">
                  <Collapsible.Trigger class="group flex items-center gap-0.5">
                    <ChevronDown class="size-5 transition-all duration-300 group-data-[state=open]:-rotate-180" />
                    <SectionSubtitle class="my-0">Best run</SectionSubtitle>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    {#each Object.entries(catacomb.best_run) as [key, value]}
                      {#if typeof value === "number"}
                        {#if key === "timestamp"}
                          <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={formatDistanceToNowStrict(value, { addSuffix: true })} asterisk={true}>
                            {formatDate(value, "dd MMMM yyyy 'at' HH:mm")}
                          </AdditionStat>
                        {:else}
                          <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={formatNumber(value)} />
                        {/if}
                      {:else}
                        <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={value} />
                      {/if}
                    {/each}
                  </Collapsible.Content>
                </Collapsible.Root>
              {:else}
                <div class="p-5 text-center">This player has not completed this floor.</div>
              {/if}
            </div>
          {/each}
        {:else}
          This player has not played any Catacombs.
        {/if}
      </div>
    </div>

    <div>
      <h4 class="my-5 text-xl font-semibold capitalize text-text/90">Master Catacombs</h4>
      <div class="flex flex-wrap gap-5">
        {#if dungeons.master_catacombs}
          {#each dungeons.master_catacombs as catacomb}
            <div class="flex min-w-80 basis-[calc((100%/3)-1.25rem)] flex-col gap-1 rounded-lg bg-background/30">
              <div class="flex w-full items-center justify-center gap-1.5 border-b-2 border-icon py-2 text-center font-semibold uppercase">
                <Avatar.Root>
                  <Avatar.Image loading="lazy" src={catacomb.texture} class="size-8 object-contain" />
                  <Avatar.Fallback>
                    <Image class="size-8" />
                  </Avatar.Fallback>
                </Avatar.Root>
                {catacomb.name}
              </div>

              <Collapsible.Root class="p-5">
                <Collapsible.Trigger class="group flex items-center gap-0.5">
                  <ChevronDown class="size-5 transition-all duration-300 group-data-[state=open]:-rotate-180" />
                  <SectionSubtitle class="my-0">Floor Stats</SectionSubtitle>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  {#each Object.entries(catacomb.stats) as [key, value]}
                    {#if typeof value === "object"}
                      <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={formatNumber(value.damage)} subData="({value.type})" />
                    {:else}
                      <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={formatNumber(value)} />
                    {/if}
                  {/each}
                </Collapsible.Content>
              </Collapsible.Root>

              {#if catacomb.best_run}
                <Collapsible.Root class="px-5 pb-[2.5rem]">
                  <Collapsible.Trigger class="group flex items-center gap-0.5">
                    <ChevronDown class="size-5 transition-all duration-300 group-data-[state=open]:-rotate-180" />
                    <SectionSubtitle class="my-0">Best run</SectionSubtitle>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    {#each Object.entries(catacomb.best_run) as [key, value]}
                      {#if typeof value === "number"}
                        {#if key === "timestamp"}
                          <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={formatDistanceToNowStrict(value, { addSuffix: true })} asterisk={true}>
                            {formatDate(value, "dd MMMM yyyy 'at' HH:mm")}
                          </AdditionStat>
                        {:else}
                          <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={formatNumber(value)} />
                        {/if}
                      {:else}
                        <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={value} />
                      {/if}
                    {/each}
                  </Collapsible.Content>
                </Collapsible.Root>
              {:else}
                <div class="p-5 text-center">This player has not completed this floor.</div>
              {/if}
            </div>
          {/each}
        {:else}
          This player has not played any Master Catacombs.
        {/if}
      </div>
    </div>
  {/if}
</div>
