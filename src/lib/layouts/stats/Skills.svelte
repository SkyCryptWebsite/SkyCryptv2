<script lang="ts">
  import Skillbar from "$lib/components/Skillbar.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");
</script>

<div class="skills space-y-2">
  <Skillbar class="sm:w-full" skill="Level" skillData={profile.skyblock_level} />

  <div class="flex flex-col flex-wrap gap-x-4 gap-y-2 sm:flex-row">
    {#each Object.entries(profile.skills.skills) as [skillName, skillData]}
      <Skillbar skill={skillName} {skillData} />
    {/each}
  </div>
</div>
