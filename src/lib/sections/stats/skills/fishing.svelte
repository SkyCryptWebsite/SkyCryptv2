<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { getRarityClass } from "$lib/tools";
  import { cn } from "$lib/utils";
  import type { Stats as StatsType } from "$types/stats";
  import { Avatar, Collapsible } from "bits-ui";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import Image from "lucide-svelte/icons/image";
  import { getContext } from "svelte";
  import { fade } from "svelte/transition";

  const profile = getContext<StatsType>("profile");

  const highestPriorityFishingTool = profile.items.fishing_tools.highest_priority_tool;
  const fishingTools = profile.items.fishing_tools.tools;
</script>

<h3 class="text-xl font-semibold">Fishing</h3>
<div class="space-y-0.5">
  <AdditionStat text="Items Fished" data="TODO" />
  <AdditionStat text="Treasures Fished" data={profile.fishing.treasure.toString()} />
  <AdditionStat text="Large Treasures Fished" data={profile.fishing.treasureLarge.toString()} />
  <AdditionStat text="Sea Creatures Killed" data="TODO" />
  <AdditionStat text="Trophy Fish Fished" data={profile.fishing.trophyFishCaught.toString()} />
</div>

<Items>
  <div slot="text" class="space-y-2">
    <h3 class="text-xl font-semibold">Fishing Rods</h3>
    <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
      <span>Active Rod:</span>
      <span class={cn(getRarityClass(highestPriorityFishingTool.rarity ?? "", "text"))}>{highestPriorityFishingTool.display_name}</span>
    </p>
  </div>
  {#each fishingTools as tool}
    <Item piece={tool} />
  {/each}
</Items>

<Collapsible.Root open={true}>
  <Collapsible.Trigger class="group flex items-center gap-0.5">
    <ChevronDown class="size-4 transition-all duration-300 group-data-[state=open]:-rotate-180" />
    Sea Creatures
  </Collapsible.Trigger>
  <Collapsible.Content class="mt-4 flex flex-wrap gap-4">
    {@const seaCreatures = Object.entries(profile.fishing.kills)}
    {#each seaCreatures as [_, seaCreature], index}
      <div class="flex size-full max-h-56 max-w-36 flex-col rounded-lg bg-background/30 p-2" in:fade|global={{ duration: 300, delay: 25 * (index + 1) }} out:fade|global={{ duration: 300, delay: 5 * (seaCreatures.length - index) }}>
        <div class="flex h-12 items-center justify-center border-b-2 border-icon pb-2 text-center font-bold">
          {seaCreature.name}
        </div>
        <div class="mt-2 flex h-full flex-col items-center justify-center gap-4">
          <Avatar.Root class="flex items-center justify-center">
            <Avatar.Image />
            <Avatar.Fallback>
              <Image class="size-24" />
            </Avatar.Fallback>
          </Avatar.Root>
          <div class="text-center font-bold">
            {seaCreature.amount} <span class="text-text/60">Kills</span>
          </div>
        </div>
      </div>
    {/each}
  </Collapsible.Content>
</Collapsible.Root>
