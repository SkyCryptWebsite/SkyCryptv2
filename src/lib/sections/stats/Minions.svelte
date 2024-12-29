<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { calculatePercentage } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import { Avatar, Button } from "bits-ui";
  import ExternalLink from "lucide-svelte/icons/external-link";

  const { profile } = getProfileCtx();

  const minions = $derived(profile.minions);

  const romanTiers = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const arabicTiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
</script>

<Items title="Minions" class="flex-col">
  <div slot="text">
    <AdditionStat text="Unique Minions" data="{minions.maxedTiers} / {minions.totalTiers} ({calculatePercentage(minions.maxedTiers, minions.totalTiers, 0)}%)" maxed={minions.maxedTiers === minions.totalTiers} />
    <AdditionStat text="Minion Slots" data={minions.minionsSlots.current} subData="({minions.minionsSlots.next} to next slot)" />
    <AdditionStat text="Bonus Minion Slots" data="{minions.minionsSlots.bonusSlots} / 5" maxed={minions.minionsSlots.bonusSlots === 5} />
    <AdditionStat text="Maxed Minions" data="{minions.maxedMinions} / {minions.totalMinions}" maxed={minions.maxedMinions === minions.totalMinions} />
  </div>

  <Button.Root href="https://minionah.com" target="_blank" class="flex h-fit w-fit max-w-fit items-center gap-2 rounded-lg bg-background/30 p-2 transition-all duration-300 hover:scale-105">
    <Avatar.Root class="size-12 shrink-0">
      <Avatar.Image src="/img/icons/minionah.png" alt="MinionAH" class="aspect-square size-12" />
      <Avatar.Fallback class="flex size-12 items-center justify-center rounded-lg bg-background/10 font-semibold">MA</Avatar.Fallback>
    </Avatar.Root>
    <div>
      <h6 class="text-pretty font-bold text-text">Looking for a place to trade minions?</h6>
      <span class="relative block w-fit text-left font-semibold text-text/60">
        Check out <h5 class="inline text-link underline">MinionAH</h5>
        <ExternalLink class="absolute -right-3 top-0 size-3 text-link" />
      </span>
    </div>
  </Button.Root>

  {#each Object.entries(minions.minions) as [category, data]}
    <div class="flex items-center gap-1 text-base font-semibold uppercase">
      <h3 class="text-xl">{category}</h3>
      {#if data.maxedMinions === data.totalMinions}
        <span class="text-gold">Max!</span>
      {:else}
        <span class="text-text/80">({data.maxedMinions} / {data.totalMinions} max)</span>
      {/if}
    </div>

    <div class="flex flex-wrap gap-4">
      {#each data.minions as minion}
        {@const hasTier = minion.tiers[minion.tiers.length - 1]}
        {@const hasMaxed = hasTier === minion.maxTier}
        <Chip image={{ src: minion.texture }} class={cn("h-fit w-fit", { "opacity-50": !hasTier })} variant="tooltip">
          <div class={cn("flex flex-col", { "text-maxed": hasMaxed })}>
            <div class="font-bold">
              <span class={cn(hasMaxed ? "text-maxed" : "opacity-60")}>{minion.name}</span>
              <span class={cn({ "text-gold": hasMaxed })}>{hasTier ? minion.tiers[minion.tiers.length - 1] : 0}</span>
            </div>
          </div>
          <div slot="tooltip">
            <div class="flex gap-1">
              {#each arabicTiers.slice(0, minion.maxTier) as tier}
                {@const hasTier = minion.tiers.includes(tier)}
                <span class={cn("text-sm font-medium", { "text-link": hasTier })}>{romanTiers[tier - 1]}</span>
              {/each}
            </div>
          </div>
        </Chip>
      {/each}
    </div>
  {/each}
</Items>
