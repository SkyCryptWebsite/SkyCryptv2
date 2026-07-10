<script lang="ts">
  import { getCombinedContext } from "$ctx";
  import { Chip, SearchTabs } from "$lib/components/misc";
  import { Section } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { calculatePercentage } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import * as Avatar from "$ui/avatar";
  import * as Item from "$ui/item";
  import BotIcon from "@lucide/svelte/icons/bot";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";

  let { order }: { order: number } = $props();

  const minions = $derived(getCombinedContext().current?.minions);

  const romanTiers = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const arabicTiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const categoryTabs = $derived.by(() => {
    if (!minions?.minions) return [];

    return Object.entries(minions.minions).map(([key, data]) => ({
      value: key,
      label: key,
      items: (data.minions ?? []).filter((minion) => minion.tiers),
      triggerClass: "text-white"
    }));
  });
</script>

<Section id="Minions" {order}>
  <div class="contents space-y-4">
    <Item.Root variant="outline" class="[a]:hover:bg-foreground/10 w-fit rounded-full mx-auto hover:scale-95 [a]:transition-[scale,background-color] ease-out duration-150">
      {#snippet child({ props })}
        <a href="https://minionah.com/" target="_blank" {...props}>
          <Item.Media>
            <Avatar.Root class="after:rounded-none after:border-none">
              <Avatar.Image src="/img/icons/minionah.avif" alt="MinionAH" class="rounded-none" />
              <Avatar.Fallback class="bg-transparent border">MI</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title class="gap-1">Looking for a place to trade minions? Check out <span class="underline text-primary inline-flex items-start gap-0.5 flex-nowrap">MinionAH <ExternalLinkIcon class="size-3" /></span></Item.Title>
          </Item.Content>
        </a>
      {/snippet}
    </Item.Root>
    {#if minions}
      <div class="border p-4 rounded-xl">
        <div class="space-y-0.5">
          {#if minions.maxedTiers != null && minions.totalTiers != null}
            <AdditionStat text="Unique Minions" data="{minions.maxedTiers} / {minions.totalTiers} ({calculatePercentage(minions.maxedTiers, minions.totalTiers, 0)}%)" maxed={minions.maxedTiers === minions.totalTiers} />
          {/if}
          {#if minions.minionsSlots}
            <AdditionStat text="Minion Slots" data={minions.minionsSlots.current ?? 0} subData="({minions.minionsSlots.next} to next slot)" maxed={minions.maxedTiers === minions.totalTiers} />
            <AdditionStat text="Bonus Minion Slots" data="{minions.minionsSlots.bonusSlots} / 5" maxed={minions.minionsSlots.bonusSlots === 5} />
          {/if}
          {#if minions.maxedMinions != null && minions.totalMinions != null}
            <AdditionStat text="Maxed Minions" data="{minions.maxedMinions} / {minions.totalMinions}" maxed={minions.maxedMinions === minions.totalMinions} />
          {/if}
        </div>
      </div>

      <SearchTabs tabs={categoryTabs} placeholder="Search minions" searchKeys={(minion) => [minion.name]} itemKey={(minion, index) => minion.name ?? index} noResultsLabel="No minions match your search.">
        {#snippet tabHeader(value)}
          {const data = minions.minions?.[value]}
          {#if data}
            <div class="mb-4 text-base font-semibold uppercase">
              {#if data.maxedMinions === data.totalMinions}
                <span class="text-accent-4">Max!</span>
              {:else}
                <span class="text-foreground/80">{data.maxedMinions} / {data.totalMinions} maxed</span>
              {/if}
            </div>
          {/if}
        {/snippet}
        {#snippet item(minion)}
          {const tiers = minion.tiers ?? []}
          {const hasTier = tiers[tiers.length - 1]}
          {const hasMaxed = hasTier === minion.maxTier}
          <Chip image={{ src: minion.texture ?? "" }} class={cn("h-fit w-fit", { "opacity-50": !hasTier })}>
            <div class={cn("flex flex-col", { "text-accent-2": hasMaxed })}>
              <div class="font-bold whitespace-nowrap">
                <span class={cn(hasMaxed ? "text-accent-2" : "opacity-60")}>{minion.name}</span>
                <span class={cn({ "text-accent-4": hasMaxed })}>{hasTier ? tiers[tiers.length - 1] : 0}</span>
              </div>
            </div>
            {#snippet tooltip()}
              <div class="flex gap-1">
                {#each arabicTiers.slice(0, minion.maxTier) as tier (tier)}
                  {const unlocked = tiers.includes(tier)}
                  <span class={cn("text-sm font-medium", { "text-primary": unlocked })}>{romanTiers[tier - 1]}</span>
                {/each}
              </div>
            {/snippet}
          </Chip>
        {/snippet}
      </SearchTabs>
    {:else}
      <EmptyStat title="No Data" description="This player doesn't have any minions" icon={BotIcon} />
    {/if}
  </div>
</Section>
