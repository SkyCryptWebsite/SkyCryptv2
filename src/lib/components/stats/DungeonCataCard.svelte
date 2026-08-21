<script lang="ts">
  import { AdditionStat } from "$lib/components/stats";
  import { type ModelsFormattedDungeonFloor } from "$lib/shared/api/orval-generated";
  import { formatNumber } from "$lib/shared/helper";
  import CollapsibleCustomTrigger from "$src/lib/components/CollapsibleCustomTrigger.svelte";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import * as Avatar from "$ui/avatar";
  import * as Collapsible from "$ui/collapsible";
  import { Separator } from "$ui/separator";
  import { tz } from "@date-fns/tz";
  import CircleQuestionMarkIcon from "@lucide/svelte/icons/circle-question-mark";
  import Image from "@lucide/svelte/icons/image";
  import TrophyIcon from "@lucide/svelte/icons/trophy";
  import {
    formatDate,
    formatDistanceToNowStrict,
    formatDuration as formatDurationDateFns,
    intervalToDuration
  } from "date-fns";

  let { catacombs, master = false }: { catacombs: ModelsFormattedDungeonFloor[] | undefined; master?: boolean } =
    $props();

  function formatDuration(end: number) {
    const interval = intervalToDuration(
      { start: 0, end },
      { in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) }
    );

    // Always extract and format both minutes and seconds
    const minutes = interval.minutes ?? 0;
    const seconds = interval.seconds ?? 0;

    const duration = formatDurationDateFns(
      { minutes, seconds },
      {
        format: ["minutes", "seconds"],
        delimiter: ":",
        zero: true,
        locale: {
          formatDistance: (_token, count) => String(count).padStart(2, "0")
        }
      }
    );

    if (duration === "") return "-";
    return duration;
  }
</script>

{#if catacombs}
  <ScrollAreaItems>
    {#each catacombs as catacomb, index (index)}
      {#if catacomb.stats}
        {#if catacomb.stats.tier_completions != null && catacomb.stats.tier_completions > 0}
          <div class="flex w-sm flex-col self-start rounded-xl border bg-background/50">
            <div class="flex w-full items-center justify-center gap-1.5 py-2 text-center font-semibold uppercase">
              <Avatar.Root class="after:rounded-none after:border-none">
                <Avatar.Image
                  loading="lazy"
                  src={catacomb.texture}
                  class="size-8 rounded-none object-contain [image-rendering:pixelated]" />
                <Avatar.Fallback class="bg-transparent">
                  <Image class="size-8" />
                </Avatar.Fallback>
              </Avatar.Root>
              {catacomb.name}
            </div>
            <Separator class="bg-primary" />

            <div class="space-y-4 p-4">
              <Collapsible.Root>
                <CollapsibleCustomTrigger class="h-auto py-0">Floor Stats</CollapsibleCustomTrigger>
                <Collapsible.Content class="px-5">
                  {#each Object.entries(catacomb.stats) as [key, value], index (index)}
                    {#if typeof value === "object"}
                      <AdditionStat
                        class="capitalize"
                        text={key.toLowerCase().replaceAll("_", " ")}
                        data={formatNumber(value.damage)}
                        subData="({value.type})" />
                    {:else if key.includes("time") && key !== "times_played"}
                      <AdditionStat
                        class="capitalize"
                        text={key.toLowerCase().replaceAll("_", " ")}
                        data={formatDuration(value)} />
                    {:else}
                      <AdditionStat
                        class="capitalize"
                        text={key.toLowerCase().replaceAll("_", " ")}
                        data={formatNumber(value)} />
                    {/if}
                  {/each}
                </Collapsible.Content>
              </Collapsible.Root>

              {#if catacomb.best_run}
                <Collapsible.Root>
                  <CollapsibleCustomTrigger class="h-auto py-0">Best Run</CollapsibleCustomTrigger>

                  <Collapsible.Content class="px-5">
                    {#each Object.entries(catacomb.best_run) as [key, value], index (index)}
                      {#if typeof value === "number"}
                        {#if key === "timestamp"}
                          <AdditionStat
                            class="capitalize"
                            text={key.toLowerCase().replaceAll("_", " ")}
                            data={formatDistanceToNowStrict(value, {
                              addSuffix: true,
                              in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                            })}
                            asterisk={true}>
                            {formatDate(value, "dd MMMM yyyy 'at' HH:mm", {
                              in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                            })}
                          </AdditionStat>
                        {:else if key.includes("time")}
                          <AdditionStat
                            class="capitalize"
                            text={key.toLowerCase().replaceAll("_", " ")}
                            data={formatDuration(value)} />
                        {:else}
                          <AdditionStat
                            class="capitalize"
                            text={key.toLowerCase().replaceAll("_", " ")}
                            data={formatNumber(value)} />
                        {/if}
                      {:else}
                        <AdditionStat class="capitalize" text={key.toLowerCase().replaceAll("_", " ")} data={value} />
                      {/if}
                    {/each}
                  </Collapsible.Content>
                </Collapsible.Root>
              {:else}
                <EmptyStat
                  title="No Best Run"
                  description="This player has not completed this floor"
                  icon={TrophyIcon} />
              {/if}
            </div>
          </div>
        {/if}
      {/if}
    {/each}
  </ScrollAreaItems>
{:else}
  <EmptyStat
    title="No Data"
    description="This player has not played any {master ? 'Master Catacombs' : 'Catacombs'}"
    icon={CircleQuestionMarkIcon}
    class="mt-2" />
{/if}
