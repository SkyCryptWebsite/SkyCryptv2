<script lang="ts">
  import Skillbar from "$lib/components/Skillbar.svelte";
  import type { Stats as StatsType } from "$lib/types/stats";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");
</script>

<div class="skills space-y-2 pr-2 @md:pr-0">
  <Skillbar class="@md:w-full" skill="Level" skillData={profile.skyblock_level} />

  <div class="flex flex-col flex-wrap gap-x-4 gap-y-2 @md:flex-row">
    {#each Object.entries(profile.skills.skills) as [skillName, skillData]}
      <Skillbar skill={skillName} {skillData} />
    {/each}
  </div>
</div>
