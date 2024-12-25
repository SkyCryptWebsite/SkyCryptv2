<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Bonus from "$lib/components/Bonus.svelte";
  import SectionTitle from "$lib/components/SectionTitle.svelte";
  import { Avatar, Progress } from "bits-ui";
  import Image from "lucide-svelte/icons/image";
  import { format } from "numerable";

  const { profile } = getProfileCtx();
  const slayer = $derived(profile.slayer);
</script>

<div class="space-y-4">
  <SectionTitle>Slayer</SectionTitle>
  {#if slayer}
    <div class="pb-1.5 pt-4">
      <AdditionStat text="Total Slayer XP" data={format(slayer.totalSlayerExp)} />
    </div>
    <div class="flex flex-wrap gap-5">
      {#each Object.entries(slayer.data) as [key, value]}
        {#if value.level.xp > 0}
          <div class="relative flex min-w-[min(20.625rem,100vw)] flex-col items-center gap-1 space-y-5 overflow-hidden rounded-lg bg-background/30">
            <div class="flex w-full items-center justify-center gap-1.5 border-b-2 border-icon py-2 text-center font-semibold uppercase">
              <Avatar.Root>
                <Avatar.Image loading="lazy" src={value.texture} class="size-8 object-contain" />
                <Avatar.Fallback>
                  <Image class="size-8" />
                </Avatar.Fallback>
              </Avatar.Root>
              {value.name}
            </div>
            <div class="flex h-full w-full flex-wrap gap-5 px-5 uppercase">
              {#each Object.entries(value.kills) as [key, killValue]}
                <div class="flex flex-col items-center gap-1 text-sm font-bold text-text/60">
                  <span>
                    {#if !isNaN(Number(key))}
                      Tier {["I", "II", "III", "IV", "V"][Number(key) - 1]}
                    {:else}
                      {key}
                    {/if}
                  </span>
                  <span class="text-text">
                    {format(killValue)}
                  </span>
                </div>
              {/each}
            </div>
            <div class="w-full">
              <p class="mb-2 w-full space-y-5 px-5 text-center font-semibold capitalize text-text/60">
                {key} Level {value.level.level}
              </p>

              <Progress.Root value={value.level.xp} max={value.level.xpForNext} class="group h-4 w-full overflow-hidden bg-text/30" data-maxed={value.level.maxed}>
                <div class="absolute z-10 flex h-full w-full justify-center">
                  <div class="text-xs font-semibold shadow-background/50 text-shadow">
                    {#if value.level.maxed}
                      {format(value.level.xp)}
                    {:else}
                      {format(value.level.xp)} / {format(value.level.xpForNext)}
                    {/if}
                    XP
                  </div>
                </div>
                <div class="h-full w-full flex-1 transition-all duration-1000 ease-in-out group-data-[maxed=false]:bg-skillbar group-data-[maxed=true]:bg-maxedbar" style={`transform: translateX(-${100 - (value.level.xp / (value.level.maxed ? value.level.xp : value.level.xpForNext)) * 100}%)`}></div>
              </Progress.Root>
            </div>
          </div>
        {/if}
      {/each}
    </div>
    <Bonus title="Bonus:" stats={slayer.stats} />
  {/if}
</div>
