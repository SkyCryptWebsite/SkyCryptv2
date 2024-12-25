<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { cn } from "$lib/shared/utils";
  import { format } from "numerable";

  const { profile } = getProfileCtx();

  const bestiary = $derived(profile.bestiary);
</script>

<Items title="Bestiary" class="flex-col">
  <div slot="text">
    <AdditionStat text="Bestiary Level" data="{bestiary.level} / {bestiary.maxLevel}" maxed={bestiary.level === bestiary.maxLevel} />
    <AdditionStat text="Families Unlocked" data="{bestiary.familiesUnlocked} / {bestiary.totalFamilies}" maxed={bestiary.familiesUnlocked === bestiary.totalFamilies} />
    <AdditionStat text="Families Completed" data="{bestiary.familiesCompleted} / {bestiary.totalFamilies}" maxed={bestiary.familiesCompleted === bestiary.totalFamilies} />
    <AdditionStat text="Families Tiers" data="{bestiary.familyTiers} / {bestiary.maxFamilyTiers}" maxed={bestiary.familyTiers === bestiary.maxFamilyTiers} />
  </div>
  {#each Object.entries(bestiary.categories) as [_, data]}
    <div class="flex items-center gap-1 text-base font-semibold uppercase">
      <h3 class="text-xl">{data.name}</h3>
      {#if data.mobsMaxed === data.mobs.length}
        <span class="text-gold">Max!</span>
      {:else}
        <span class="text-text/80">({data.mobsMaxed} / {data.mobs.length} max)</span>
      {/if}
    </div>

    <div class="flex flex-wrap gap-4">
      {#each data.mobs as mob}
        {@const hasKilled = mob.kills}
        {@const hasMaxed = mob.tier === mob.maxTier}
        <Chip image={{ src: mob.texture }} class={cn("h-fit w-fit", { "opacity-50": !hasKilled })} variant="tooltip">
          <div class={cn("flex flex-col")}>
            <div class="font-bold">
              <span class={cn(hasMaxed ? "text-maxed" : "opacity-60")}>{mob.name}</span>
              <span class={cn({ "text-gold": hasMaxed })}>{mob.tier}</span>
              <div class="text-sm">
                <span class="opacity-60">Kills:</span>
                <span class="text-text">{format(mob.kills)}</span>
              </div>
            </div>
          </div>
          <div slot="tooltip" class="text-sm font-bold">
            {#if hasMaxed}
              <span class="opacity-85">Progress:</span>
              <span class="text-gold">max!</span>
            {:else}
              <div class="flex flex-col gap-4">
                <div>
                  <span class="opacity-85">
                    Progress to Tier {mob.tier + 1}:
                  </span>
                  <span class="text-text">{format(mob.kills)} / {format(mob.nextTierKills)}</span>
                </div>
                <div>
                  <span class="opacity-85"> Overall progress: </span>
                  <span class="text-text opacity-100">{format(mob.kills)} / {format(mob.maxKills)}</span>
                </div>
              </div>
            {/if}
          </div>
        </Chip>
      {/each}
    </div>
  {/each}
</Items>
