<script lang="ts">
  import { getProfileContext } from "$ctx";
  import { Skillbar } from "#lib/components/stats";

  const profile = $derived(getProfileContext().current);
</script>

<div class="space-y-2 pr-2 @md:pr-0">
  {#if profile != null}
    {#if profile.skyblock_level?.level}
      {#if profile.skyblock_level.level > 0}
        <Skillbar class="@md:w-full" skill="Level" skillData={profile.skyblock_level} />
      {/if}
    {/if}

    {#if profile.skills?.skills}
      <div class="flex flex-col flex-wrap gap-x-4 gap-y-2 @md:flex-row">
        {#each Object.entries(profile.skills.skills) as [skillName, skillData], index (index)}
          <Skillbar skill={skillName} {skillData} apiEnabled={profile.apiSettings?.skills} />
        {/each}
      </div>
    {/if}
  {/if}
</div>
