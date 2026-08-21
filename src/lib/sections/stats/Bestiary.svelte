<script lang="ts">
  import { getCombinedContext } from "$ctx";
  import { Chip, SearchTabs } from "$lib/components/misc";
  import { Section } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { cn } from "$lib/shared/utils";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import PawPrintIcon from "@lucide/svelte/icons/paw-print";
  import { format } from "numerable";

  let { order }: { order: number } = $props();

  const bestiary = $derived(getCombinedContext().current?.bestiary);

  const categoryTabs = $derived.by(() => {
    if (!bestiary?.categories) return [];

    return Object.entries(bestiary.categories).map(([key, data]) => ({
      value: key,
      label: data.name ?? key,
      items: data.mobs ?? [],
      triggerClass: "text-white"
    }));
  });
</script>

<Section id="Bestiary" {order}>
  {#if bestiary}
    <div class="contents space-y-4">
      <div class="rounded-xl border p-4">
        <div class="space-y-0.5">
          <AdditionStat
            text="Bestiary Level"
            data="{bestiary.level} / {bestiary.maxLevel}"
            maxed={bestiary.level === bestiary.maxLevel} />
          <AdditionStat
            text="Families Unlocked"
            data="{bestiary.familiesUnlocked} / {bestiary.totalFamilies}"
            maxed={bestiary.familiesUnlocked === bestiary.totalFamilies} />
          <AdditionStat
            text="Families Completed"
            data="{bestiary.familiesCompleted} / {bestiary.totalFamilies}"
            maxed={bestiary.familiesCompleted === bestiary.totalFamilies} />
          <AdditionStat
            text="Families Tiers"
            data="{bestiary.familyTiers} / {bestiary.maxFamilyTiers}"
            maxed={bestiary.familyTiers === bestiary.maxFamilyTiers} />
        </div>
      </div>

      <SearchTabs
        tabs={categoryTabs}
        orientation="vertical"
        placeholder="Search mobs"
        searchKeys={(mob) => [mob.name]}
        itemKey={(mob, index) => mob.name ?? index}
        noResultsLabel="No mobs match your search.">
        {#snippet tabHeader(value)}
          {const data = bestiary.categories?.[value]}
          {#if data}
            <div class="mb-4 text-base font-semibold uppercase">
              {#if data.mobsMaxed === data.mobs?.length}
                <span class="text-accent-4">Max!</span>
              {:else}
                <span class="text-foreground/80">{data.mobsMaxed} / {data.mobs?.length} maxed</span>
              {/if}
            </div>
          {/if}
        {/snippet}
        {#snippet item(mob)}
          {const hasKilled = mob.kills}
          {const hasMaxed = mob.tier === mob.maxTier}
          <Chip image={{ src: mob.texture ?? "" }} class={cn("h-fit w-fit", { "opacity-50": !hasKilled })}>
            <div class="flex flex-col">
              <div class="font-bold whitespace-nowrap">
                <span class={cn(hasMaxed ? "text-accent-2" : "opacity-60")}>{mob.name}</span>
                <span class={cn({ "text-accent-4": hasMaxed })}>{mob.tier}</span>
                <div class="text-sm">
                  <span class="opacity-60">Kills:</span>
                  <span class="text-foreground">{format(mob.kills)}</span>
                </div>
              </div>
            </div>
            {#snippet tooltip()}
              <div class="text-sm font-bold">
                {#if hasMaxed}
                  <span class="opacity-85">Progress:</span>
                  <span class="text-accent-4">max!</span>
                {:else}
                  <div class="flex flex-col gap-4">
                    <div>
                      <span class="opacity-85">
                        Progress to Tier {(mob.tier ?? 0) + 1}:
                      </span>
                      <span class="text-foreground">{format(mob.kills)} / {format(mob.nextTierKills)}</span>
                    </div>
                    <div>
                      <span class="opacity-85"> Overall progress: </span>
                      <span class="text-foreground opacity-100">{format(mob.kills)} / {format(mob.maxKills)}</span>
                    </div>
                  </div>
                {/if}
              </div>
            {/snippet}
          </Chip>
        {/snippet}
      </SearchTabs>
    </div>
  {:else}
    <EmptyStat title="No Data" description="This player doesn't have any bestiary progress" icon={PawPrintIcon} />
  {/if}
</Section>
