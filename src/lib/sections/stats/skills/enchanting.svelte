<script lang="ts">
  import { getSkillsContext } from "$ctx";
  import { Chip } from "$lib/components/misc";
  import { AdditionStat } from "$lib/components/stats";
  import CollapsibleCustomTrigger from "$src/lib/components/CollapsibleCustomTrigger.svelte";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import * as Collapsible from "$ui/collapsible";
  import { tz } from "@date-fns/tz";
  import LockIcon from "@lucide/svelte/icons/lock";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import { formatDistanceToNowStrict } from "date-fns";

  const data = $derived(getSkillsContext().skills);
  const enchanting = $derived(data?.enchanting);
</script>

{#if enchanting}
  {#if enchanting.unlocked === false}
    <EmptyStat title="Locked" description="This player hasn't unlocked Enchanting yet" icon={LockIcon} />
  {:else}
    <Collapsible.Root open={true} class="rounded-xl border p-2">
      <CollapsibleCustomTrigger>Experiments</CollapsibleCustomTrigger>
      <Collapsible.Content>
        {#if enchanting && enchanting.data}
          {const enchantingStats = Object.entries(enchanting.data)}
          <ScrollAreaItems>
            {#each enchantingStats as [_key, enchating], index (index)}
              <div class="flex min-w-80 flex-col items-center gap-2 rounded-xl border bg-background/50">
                <div
                  class="flex w-full items-center justify-center border-b border-primary py-2 text-center font-semibold">
                  {enchating.name}
                </div>
                {#if enchating.stats}
                  <div class="w-full px-4">
                    {#if enchating.stats.bonusClicks}
                      <AdditionStat text="Bonus Clicks" data={enchating.stats.bonusClicks} />
                    {/if}
                    {#if enchating.stats.lastAttempt}
                      <AdditionStat
                        text="Last Attempt"
                        data={formatDistanceToNowStrict(enchating.stats.lastAttempt, {
                          addSuffix: true,
                          in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                        })} />
                    {/if}
                    {#if enchating.stats.lastClaimed}
                      <AdditionStat
                        text="Last Claimed"
                        data={formatDistanceToNowStrict(enchating.stats.lastClaimed, {
                          addSuffix: true,
                          in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                        })} />
                    {/if}
                  </div>
                {/if}
                {#if enchating.stats}
                  <div class="w-full space-y-4 px-4 pb-4">
                    {#each enchating.stats.games as game, index (index)}
                      <Chip image={{ src: game.texture ?? "" }} class="w-full max-w-none">
                        <div class="flex flex-col">
                          <div class="flex flex-col gap-0.5">
                            <h4 class="font-bold text-muted-foreground">{game.name}</h4>
                          </div>
                          <div class="flex w-full flex-col gap-0.5">
                            {#if game.attempts}
                              <AdditionStat text="Attempts" data={game.attempts} />
                            {/if}
                            {#if game.claims}
                              <AdditionStat text="Claims" data={game.claims} />
                            {/if}
                            {#if game.bestScore}
                              <AdditionStat text="Best Score" data={game.bestScore} />
                            {/if}
                          </div>
                        </div>
                      </Chip>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </ScrollAreaItems>
        {:else}
          <EmptyStat
            title="No Data"
            description="This player doesn't have anything related to experiments"
            icon={SparklesIcon} />
        {/if}
      </Collapsible.Content>
    </Collapsible.Root>
  {/if}
{:else}
  <EmptyStat
    title="No Data"
    description="This player doesn't have anything related to enchanting"
    icon={SparklesIcon}
    class="mt-2" />
{/if}
