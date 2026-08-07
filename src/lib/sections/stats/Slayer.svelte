<script lang="ts">
  import { getCombinedContext } from "$ctx";
  import { Section } from "$lib/components/sections";
  import { AdditionStat, Bonus } from "$lib/components/stats";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import { formatNumber } from "$src/lib/shared/helper";
  import * as Avatar from "$ui/avatar";
  import { Progress } from "$ui/progress";
  import Image from "@lucide/svelte/icons/image";
  import SkullIcon from "@lucide/svelte/icons/skull";
  import { format } from "numerable";

  let { order }: { order: number } = $props();

  const slayer = $derived(getCombinedContext().current?.slayers);
</script>

<Section id="Slayer" {order}>
  {#if slayer}
    {#if slayer.totalSlayerExp === 0}
      <EmptyStat title="No Slayers" description="This player hasn't unlocked Slayers yet" icon={SkullIcon} />
    {:else}
      <div class="space-y-4 rounded-xl border p-4">
        <div>
          <AdditionStat text="Total Slayer XP" data={format(slayer.totalSlayerExp)} />
          {#if slayer.stats}
            <Bonus title="Bonus:" stats={slayer.stats} />
          {/if}
        </div>

        {#if slayer.data}
          <ScrollAreaItems>
            {#each Object.entries(slayer.data) as [key, value], index (index)}
              {const isMaxed = value.level?.maxed ?? false}
              {let isHovered = $state(false)}
              {#if value.level && value.level.xp != null && value.level.xp > 0}
                <div
                  class="relative flex min-w-xs flex-col items-center gap-1 space-y-5 overflow-hidden rounded-xl border bg-background/50"
                  onpointerenter={() => (isHovered = true)}
                  onpointerleave={() => (isHovered = false)}
                  role="none">
                  <div
                    class="flex w-full items-center justify-center gap-1.5 border-b-2 border-primary py-2 text-center font-semibold uppercase">
                    <Avatar.Root class="rounded-none after:border-none">
                      <Avatar.Image
                        loading="lazy"
                        src={value.texture}
                        class="size-8 rounded-2xl object-contain [image-rendering:pixelated]" />
                      <Avatar.Fallback class="rounded-none bg-transparent">
                        <Image class="size-8" />
                      </Avatar.Fallback>
                    </Avatar.Root>
                    {value.name}
                  </div>
                  {#if value.kills}
                    <div class="flex h-full w-full flex-wrap gap-5 px-5 uppercase">
                      {#each Object.entries(value.kills) as [key, killValue], index (index)}
                        <div class="flex flex-col items-center gap-1 text-sm font-bold text-muted-foreground">
                          <span>
                            {#if !isNaN(Number(key))}
                              Tier {["I", "II", "III", "IV", "V"][Number(key) - 1]}
                            {:else}
                              {key}
                            {/if}
                          </span>
                          <span class="text-foreground">
                            {format(killValue)}
                          </span>
                        </div>
                      {/each}
                    </div>
                  {/if}
                  <div class="w-full">
                    <p class="mb-2 w-full space-y-5 px-5 text-center font-semibold text-muted-foreground capitalize">
                      {key} Level {value.level.level}
                    </p>

                    <div class="group relative" data-maxed={value.level.maxed}>
                      <Progress
                        value={value.level.xp}
                        max={value.level.xpForNext}
                        class="h-4 w-full overflow-hidden rounded-none bg-foreground/30 [&>div]:rounded-none [&>div]:group-data-[maxed=false]:bg-primary [&>div]:group-data-[maxed=true]:bg-accent-3" />
                      <div
                        class="absolute inset-0 z-10 flex w-full flex-nowrap items-center-safe justify-center-safe gap-0.5 text-xs">
                        <span class="font-bold">
                          {#if isHovered && !isMaxed}
                            {format(value.level.xp, "0,0")} / {format(value.level.xpForNext)}
                          {:else if !isMaxed}
                            {formatNumber(value.level.xp ?? 0)} / {formatNumber(value.level.xpForNext ?? 0)}
                          {/if}

                          {#if isHovered && isMaxed}
                            {format(value.level.xp, "0,0")}
                          {:else if isMaxed}
                            {formatNumber(value.level.xp ?? 0)}
                          {/if}
                        </span>
                        XP
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            {/each}
          </ScrollAreaItems>
        {/if}
      </div>
    {/if}
  {:else}
    <EmptyStat title="No Slayers" description="This player hasn't unlocked Slayers yet" icon={SkullIcon} />
  {/if}
</Section>
