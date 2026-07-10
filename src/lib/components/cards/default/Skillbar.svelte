<script lang="ts">
  import { formatNumber } from "$lib/shared/helper";
  import type { ModelsSkill } from "$src/lib/shared/api/orval-generated";
  import { calculatePercentage } from "$src/lib/shared/helper";
  import { cn } from "$src/lib/shared/utils";
  import { Progress } from "bits-ui";
  import { getDefaultCardSettingsContext } from "./Base.svelte";

  type SkillProps = {
    skill: string;
    skillData: ModelsSkill;
    apiEnabled?: boolean;
    class?: string | null | undefined;
  };

  const { skill, skillData, apiEnabled, class: className }: SkillProps = $props();

  const isMaxed = $derived(skillData.maxed);
  const calculatedXP = $derived(isMaxed ? formatNumber(skillData.xpCurrent ?? 0) : `${formatNumber(skillData.xpCurrent ?? 0)} / ${formatNumber(skillData.xpForNext ?? 0)}`);
  const size = $derived(100 - parseFloat(calculatePercentage(skillData.xpCurrent ?? 0, isMaxed ? (skillData.xpCurrent ?? 0) : (skillData.xpForNext ?? 0))));

  const showXP = $derived(getDefaultCardSettingsContext().showXP);
</script>

<div class={cn("group relative isolate flex grow basis-full flex-col sm:basis-1/3 sm:last:odd:grow sm:last:odd:basis-1/2", !apiEnabled && "opacity-50 grayscale", className)} data-maxed={isMaxed}>
  <div class="relative ml-10 flex gap-1 text-sm font-semibold text-text capitalize">
    {skill}
    <span class="text-text/80">
      {skillData.level}
    </span>
  </div>

  <Progress.Root value={skillData.xpCurrent} max={isMaxed ? skillData.xpCurrent : skillData.xpForNext} class="relative ml-2 flex h-4 overflow-hidden rounded-full bg-foreground/30" data-api={apiEnabled}>
    <div class="relative h-full flex-1 rounded-full z-10 data-[api=false]:hidden data-[api=true]:data-[maxed=false]:bg-primary data-[api=true]:data-[maxed=true]:bg-accent-3" style="transform: translateX({-size}%);" data-maxed={isMaxed} data-api={apiEnabled}></div>

    {#if apiEnabled && showXP}
      <div class="absolute inset-0 flex h-full justify-center">
        <div class="text-xs font-semibold text-white">
          {calculatedXP} XP
        </div>
      </div>
    {/if}
  </Progress.Root>

  <div class="absolute bottom-0 left-0 z-10 flex size-9 items-center justify-center rounded-full p-1 drop-shadow-sm data-[api=false]:bg-gray-600 data-[maxed=false]:bg-primary data-[maxed=true]:bg-accent-3" data-maxed={isMaxed} data-api={apiEnabled}>
    <img loading="lazy" class="pointer-events-none size-6.5 [image-rendering:pixelated] data-[api=false]:grayscale" src={skillData.texture} alt={skill} data-api={apiEnabled} />
  </div>
</div>
