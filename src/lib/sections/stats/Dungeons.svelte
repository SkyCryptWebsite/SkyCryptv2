<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Skillbar from "$lib/components/Skillbar.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");
  const dungeons = profile.dungeons;

  console.log(dungeons);
</script>

<div class="space-y-4">
  <h3 class="text-2xl uppercase">Dungeons</h3>
  {#if dungeons}
    <div class="flex flex-col flex-wrap justify-start gap-x-4 gap-y-2 sm:flex-row">
      <Skillbar class="" skill="Catacombs" skillData={dungeons.level} />
      {#each Object.entries(dungeons.classes.classes) as [className, classData]}
        <Skillbar class="sm:last:grow sm:last:basis-1/3" skill={className} skillData={classData} />
      {/each}
    </div>
    <div>
      <AdditionStat text="Selected Class" data={dungeons.classes.selectedClass} />
      <AdditionStat text="Class Average" data={format(dungeons.classes.classAverage)} asterisk={true}>
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
      <AdditionStat text="Highest Floor Beaten (Normal)" data="TODO" />
      <AdditionStat text="Secrets Found" data={format(dungeons.secrets.found)} />
    </div>
    <div>
      <h4 class="text-xl capitalize">Catacombs</h4>
      <div class="flex flex-wrap gap-5">
        {#each Object.entries(dungeons.catacombs) as [floor, floorData]}
          {floor}
          {#each Object.entries(floorData) as [key, value]}
            TODO
          {/each}
        {/each}
      </div>
    </div>
  {/if}
</div>
