<script lang="ts">
  import { getMiscContext } from "$ctx";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { RARITY_COLORS } from "$lib/shared/constants/rarities";
  import { titleCase } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import { Label } from "$ui/label";
  import { format } from "numerable";

  const misc = $derived(getMiscContext().misc);
</script>

{#if misc && misc.pet_milestones != null}
  <div class="space-y-2 rounded-xl border p-4">
    <SectionSubtitle>Pet Milestones</SectionSubtitle>
    <div class="space-y-0.5">
      <AdditionStat
        text="Sea Creatures Killed"
        data={format(misc.pet_milestones.sea_creatures_killed.total)}
        asterisk={true}>
        <div class="space-y-1">
          {#if misc.pet_milestones.sea_creatures_killed.rarity}
            <Label class="gap-1">
              Pet:
              <span
                class="font-bold"
                style="color: var(--§{RARITY_COLORS[misc.pet_milestones.sea_creatures_killed.rarity]})"
                >{titleCase(misc.pet_milestones.sea_creatures_killed.rarity)}</span>
            </Label>
          {/if}
          {#if misc.pet_milestones.sea_creatures_killed.progress !== null}
            <Label class="gap-1">
              Progress:
              <span
                class={cn("font-bold", {
                  "text-accent-2": misc.pet_milestones.sea_creatures_killed.progress === 100.0
                })}>
                {misc.pet_milestones.sea_creatures_killed.progress === 100.0
                  ? "Maxed!"
                  : `${misc.pet_milestones.sea_creatures_killed.progress}%`}
              </span>
            </Label>
          {/if}
        </div>
      </AdditionStat>

      {#if misc.pet_milestones.ores_mined}
        <AdditionStat text="Ores Mined" data={format(misc.pet_milestones.ores_mined.total)} asterisk={true}>
          <div class="space-y-1">
            {#if misc.pet_milestones.ores_mined.rarity}
              <Label class="gap-1">
                Pet:
                <span class="font-bold" style="color: var(--§{RARITY_COLORS[misc.pet_milestones.ores_mined.rarity]})"
                  >{titleCase(misc.pet_milestones.ores_mined.rarity)}</span>
              </Label>
            {/if}

            {#if misc.pet_milestones.ores_mined.progress !== null}
              <Label class="gap-1">
                Progress:
                <span class={cn("font-bold", { "text-accent-2": misc.pet_milestones.ores_mined.progress === 100.0 })}>
                  {misc.pet_milestones.ores_mined.progress === 100.0
                    ? "Maxed!"
                    : `${misc.pet_milestones.ores_mined.progress}%`}
                </span>
              </Label>
            {/if}
          </div>
        </AdditionStat>
      {/if}
    </div>
  </div>
{/if}
