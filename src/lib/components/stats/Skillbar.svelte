<script lang="ts">
  import { getPreferences } from "$ctx";
  import type { ModelsSkill } from "$lib/shared/api/orval-generated";
  import { calculatePercentage, formatNumber } from "$lib/shared/helper";
  import * as Avatar from "$ui/avatar";
  import { Progress } from "$ui/progress";
  import { cn } from "$utils";
  import BarChartHorizontal from "@lucide/svelte/icons/bar-chart-horizontal";
  import { format } from "numerable";
  import { cubicInOut } from "svelte/easing";
  import { Tween } from "svelte/motion";

  type Props = {
    skill: string;
    skillData: ModelsSkill;
    apiEnabled?: boolean;
    class?: string | null | undefined;
  };

  let { skill, skillData, apiEnabled = true, class: className }: Props = $props();

  const isMaxed = $derived(skillData.maxed);
  const preferences = getPreferences();
  const tween = new Tween(100, { duration: 1000, easing: cubicInOut });
  let isHovered = $state(false);

  const skillbarProgress = $derived(100 - parseFloat(calculatePercentage(skillData.xpCurrent ?? 0, isMaxed ? (skillData.xpCurrent ?? 0) : (skillData.xpForNext ?? 0))));

  $effect(() => {
    tween.set(skillbarProgress);
  });
</script>

<div class={cn("group relative flex grow basis-full flex-col sm:basis-1/3 sm:last:odd:grow sm:last:odd:basis-1/2", !apiEnabled && "opacity-50 grayscale", className)} data-maxed={isMaxed} data-api={apiEnabled} onpointerenter={() => (isHovered = true)} onpointerleave={() => (isHovered = false)} role="none">
  <div class={cn("absolute border bottom-0 left-0 z-10 flex size-9 items-center justify-center rounded-full p-1 drop-shadow-sm group-data-[api=false]:bg-muted-foreground! group-data-[maxed=false]:bg-chart-2 group-data-[maxed=true]:bg-accent-2")}>
    <Avatar.Root class="select-none size-6.5 after:border-none rounded-none">
      <Avatar.Image loading="lazy" class="pointer-events-none size-6.5 /Users/gigi/Library/Application Support/CleanShot/media/media_n1jqFH4qxo/ScreenShot 2026-06-10 at 12.47 AM cKk3jnx9.png rounded-none group-[api=false]:grayscale" src={skillData.texture} alt={skill} />
      <Avatar.Fallback class="bg-transparent">
        <BarChartHorizontal class="pointer-events-none text-foreground size-6" />
      </Avatar.Fallback>
    </Avatar.Root>
  </div>

  <div class="flex items-center-safe justify-between">
    <div class="relative ml-10 text-sm font-semibold capitalize">
      {skill}
      {#if apiEnabled}
        <span class="text-foreground/80">
          {skillData.level}
        </span>
      {/if}
    </div>
    {#if apiEnabled}
      <div class="text-xs font-semibold shadow-background/50 text-shadow-md">
        {#if isHovered && !isMaxed}
          {format(skillData.xpCurrent, "0,0")} / {format(skillData.xpForNext)}
        {:else if !isMaxed}
          {formatNumber(skillData.xpCurrent ?? 0)} / {formatNumber(skillData.xpForNext ?? 0)}
        {/if}

        {#if isHovered && isMaxed}
          {format(skillData.xpCurrent, "0,0")}
        {:else if isMaxed}
          {formatNumber(skillData.xpCurrent ?? 0)}
        {/if}
        XP
      </div>
    {/if}
  </div>

  <Progress value={skillData.xpCurrent} max={isMaxed ? skillData.xpCurrent : skillData.xpForNext} class="ml-2 h-4 w-full overflow-hidden rounded-full bg-foreground/30 [&>div]:border [&>div]:rounded-full [&>div]:group-data-[maxed=false]:bg-primary [&>div]:group-data-[maxed=true]:bg-accent-3 [&>div]:group-data-[api=false]:hidden" />
</div>
