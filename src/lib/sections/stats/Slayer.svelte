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
      <div class="space-y-4 border rounded-xl p-4">
        <div>
          <AdditionStat text="Total Slayer XP" data={format(slayer.totalSlayerExp)} />
          {#if slayer.stats}
            <Bonus title="Bonus:" stats={slayer.stats} />
          {/if}
        </div>

        {#if slayer.data}
          <ScrollAreaItems>
            {#each Object.entries(slayer.data) as [key, value], index (index)}
              {#if value.level && value.level.xp != null && value.level.xp > 0}
                <div class="relative flex min-w-xs flex-col items-center gap-1 space-y-5 overflow-hidden rounded-xl bg-background/50 border">
                  <div class="flex w-full items-center justify-center gap-1.5 border-b-2 border-primary py-2 text-center font-semibold uppercase">
                    <Avatar.Root class="after:border-none rounded-none">
                      <Avatar.Image loading="lazy" src={value.texture} class="size-8 rounded-2xl object-contain [image-rendering:pixelated]" />
                      <Avatar.Fallback class="bg-transparent rounded-none">
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

                    <div class="relative group" data-maxed={value.level.maxed}>
                      <Progress value={value.level.xp} max={value.level.xpForNext} class="h-4 w-full overflow-hidden rounded-none bg-foreground/30 [&>div]:group-data-[maxed=false]:bg-primary [&>div]:rounded-none [&>div]:group-data-[maxed=true]:bg-accent-3" />
                      <div class="w-full flex z-10 inset-0 flex-nowrap text-xs absolute items-center-safe gap-0.5 justify-center-safe">
                        <span class="font-bold">
                          {#if value.level.maxed}
                            {formatNumber(value.level.xp)}
                          {:else}
                            {formatNumber(value.level.xp)} / {formatNumber(value.level.xpForNext ?? 0)}
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
