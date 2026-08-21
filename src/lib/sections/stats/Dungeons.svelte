<script lang="ts">
  import { getCombinedContext } from "$ctx";
  import { Section } from "$lib/components/sections";
  import { AdditionStat, DungeonCataCard, Skillbar } from "$lib/components/stats";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import SectionSubtitle from "$src/lib/components/sections/SectionSubtitle.svelte";
  import { Label } from "$ui/label";
  import { Separator } from "$ui/separator";
  import LockIcon from "@lucide/svelte/icons/lock";
  import SkullIcon from "@lucide/svelte/icons/skull";
  import { format } from "numerable";

  let { order }: { order: number } = $props();

  const dungeons = $derived(getCombinedContext().current?.dungeons);
</script>

<Section id="Dungeons" {order}>
  {#if dungeons}
    <div class="contents space-y-4">
      {#if dungeons.level && dungeons.level.xp === 0}
        <EmptyStat title="Locked" description="This player hasn't unlocked Dungeons yet" icon={LockIcon} />
      {:else if dungeons}
        <div class="flex flex-col flex-wrap justify-start gap-x-4 gap-y-2 rounded-xl border p-4 sm:flex-row">
          {#if dungeons.level}
            <Skillbar skill="Catacombs" skillData={dungeons.level} />
          {/if}
          {#if dungeons.classes && dungeons.classes.classes}
            {#each Object.entries(dungeons.classes.classes) as [className, classData], index (index)}
              <Skillbar class="sm:last:grow sm:last:basis-1/3" skill={className} skillData={classData} />
            {/each}
          {/if}
        </div>
        <div class="rounded-xl border p-4">
          {#if dungeons.classes}
            {#if dungeons.classes.selectedClass}
              <AdditionStat text="Selected Class" data={dungeons.classes.selectedClass} />
            {/if}
            {#if dungeons.classes.classAverage != null}
              <AdditionStat
                text="Class Average"
                data={format(dungeons.classes.classAverage)}
                asterisk={true}
                maxed={dungeons.classes.classAverage >= 50}>
                <div class="max-w-xs space-y-2">
                  {#if dungeons.classes.totalClassExp != null}
                    <div>
                      <Label class="font-bold"
                        >Total Class XP: {format(dungeons.classes.totalClassExp.toFixed(2))}</Label>
                      <p class="text-xs text-foreground/80 italic">Total Class XP gained in Catacombs.</p>
                    </div>
                  {/if}

                  {#if dungeons.classes.totalClassExp != null && dungeons.classes.classAverageWithProgress != null}
                    <Separator />
                  {/if}

                  {#if dungeons.classes.classAverageWithProgress != null}
                    <div>
                      <Label class="font-bold"
                        >Average Level: {format(dungeons.classes.classAverageWithProgress.toFixed(2))}</Label>
                      <p class="text-xs text-foreground/80 italic">
                        Average class level, includes progress to next level.
                      </p>
                    </div>
                  {/if}
                  <Separator />
                  <div>
                    <Label class="font-bold"
                      >Average Level without progress: {format(dungeons.classes.classAverage.toFixed(2))}</Label>
                    <p class="text-xs text-foreground/80 italic">
                      Average class level without including partial level progress.
                    </p>
                  </div>
                </div>
              </AdditionStat>
            {/if}
          {/if}
          {#if dungeons.stats}
            {#if dungeons.stats.highestFloorBeatenNormal != null}
              <AdditionStat
                text="Highest Floor Beaten (Normal)"
                data={format(dungeons.stats.highestFloorBeatenNormal)}
                maxed={dungeons.stats.highestFloorBeatenNormal === 7} />
            {/if}
            {#if dungeons.stats.highestFloorBeatenMaster != null}
              <AdditionStat
                text="Highest Floor Beaten (Master)"
                data={format(dungeons.stats.highestFloorBeatenMaster)}
                maxed={dungeons.stats.highestFloorBeatenMaster === 7} />
            {/if}
            <AdditionStat
              text="Secrets Found"
              data={format(dungeons.stats?.secrets?.found ?? 0)}
              subData="({format((dungeons.stats?.secrets?.secretsPerRun ?? 0).toFixed(2))} S/R)" />
          {/if}
        </div>
        <Section id="Catacombs" class="rounded-xl border p-4">
          {#snippet subtitle()}
            <SectionSubtitle>Catacombs</SectionSubtitle>
          {/snippet}
          <DungeonCataCard catacombs={dungeons.catacombs} />
        </Section>

        <Section id="Master_Catacombs" class="rounded-xl border p-4">
          {#snippet subtitle()}
            <SectionSubtitle>Master Catacombs</SectionSubtitle>
          {/snippet}
          <DungeonCataCard catacombs={dungeons.master_catacombs} master={true} />
        </Section>
      {/if}
    </div>
  {:else}
    <EmptyStat title="No Data" description="This player doesn't have anything related to dungeons" icon={SkullIcon} />
  {/if}
</Section>
