<script lang="ts">
  import { cn } from "$src/lib/shared/utils";
  import { getCardDataContext } from "..";
  import { getDefaultCardDataContext, getDefaultCardSettingsContext } from "./Base.svelte";
  import Skillbar from "./Skillbar.svelte";

  const { profile } = getCardDataContext();
  const { dungeons } = getDefaultCardDataContext();

  const { showDungeons, showSkills } = getDefaultCardSettingsContext();
  const shouldShowDungeons = $derived(dungeons?.classes?.classes && showDungeons);
  const shouldShowSkills = $derived(profile?.skills?.skills && showSkills);
</script>

{#if profile != null}
  {#if profile.skyblock_level?.level}
    {#if profile.skyblock_level.level > 0}
      <div class="flex gap-x-4 gap-y-2">
        {#if profile.skyblock_level}
          <Skillbar skill="Level" skillData={profile.skyblock_level} apiEnabled={profile.apiSettings?.skills} />
        {/if}
        {#if shouldShowDungeons && shouldShowSkills && dungeons?.level}
          <Skillbar skill="Catacombs" skillData={dungeons.level} apiEnabled={profile.apiSettings?.skills} />
        {/if}
      </div>
    {/if}
  {/if}

  {#if shouldShowSkills && profile.skills?.skills}
    <div class="h-px w-full rounded-full bg-foreground/30 py-px"></div>
    <div class={cn("grid grid-cols-3 gap-x-4 gap-y-2", shouldShowDungeons ? "grid-cols-5" : "grid-cols-3")}>
      {#each Object.entries(profile.skills.skills) as [skillName, skillData], index (index)}
        <Skillbar skill={skillName} {skillData} apiEnabled={profile.apiSettings?.skills} />
      {/each}
    </div>
  {/if}

  {#if shouldShowDungeons}
    <div class="h-px w-full rounded-full bg-foreground/30 py-px"></div>
    <div class={cn("grid grid-cols-3 gap-x-4 gap-y-2", shouldShowSkills ? "grid-cols-5" : "grid-cols-3")}>
      {#if shouldShowDungeons && !shouldShowSkills && dungeons?.level}
        <Skillbar skill="Catacombs" skillData={dungeons.level} apiEnabled={profile.apiSettings?.skills} />
      {/if}
      {#each Object.entries(dungeons!.classes!.classes!) as [className, classData], index (index)}
        <Skillbar skill={className} skillData={classData} apiEnabled={profile.apiSettings?.skills} />
      {/each}
    </div>
  {/if}
{/if}
