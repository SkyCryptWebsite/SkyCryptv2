<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { formatNumber, getRarityClass } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import type { Stats as StatsType } from "$lib/types/stats";
  import { Collapsible } from "bits-ui";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { getContext } from "svelte";

  const profile = getContext<Promise<StatsType>>("profile");

  const highestPriorityFarmingTool = profile.items.farming_tools.highest_priority_tool;
  const farmingTools = profile.items.farming_tools.tools;
</script>

<h3 class="text-xl font-semibold">Farming</h3>
<div class="space-y-5">
  <div class="space-y-0.5">
    <AdditionStat text="Farming Weight" data={formatNumber(profile.farming.weight.totalWeight)} asterisk={true}>
      <div class="space-y-5">
        <div>
          <h4 class="font-semibold text-white">Farming Weight</h4>
          <p class="text-sm italic text-text/50">Weight calculations by <a href="https://elitebot.dev/" target="_blank" class="text-icon underline">Elite</a></p>
        </div>
        <div>
          {#each Object.entries(profile.farming.weight.bonusSources) as [key, value]}
            <AdditionStat text={key} data={formatNumber(value)} class="capitalize" />
          {/each}
        </div>
        <div>
          {#each profile.farming.weight.crops as crop}
            <AdditionStat text={crop.name.toLowerCase().replace("_", " ")} data={formatNumber(crop.amount)} class="capitalize" />
          {/each}
        </div>
      </div>
    </AdditionStat>
    <AdditionStat text="Pelts" data={profile.farming.pelts.toString()} />
    <AdditionStat text="Contests Attended" data={profile.farming.contestsAttended.toString()} />
    <AdditionStat text="Unique Golds" data={profile.farming.uniqueGolds.toString()} />
  </div>

  <div class="space-y-0.5">
    {#each Object.entries(profile.farming.medals) as [medal, medalData]}
      <AdditionStat text={medal} data={medalData.total.toString()} asterisk={true}>
        {#each Object.entries(medalData) as [key, value]}
          <AdditionStat text={key} data={value.toString()} class="capitalize" />
        {/each}
      </AdditionStat>
    {/each}
  </div>
</div>

<Items>
  <div slot="text" class="space-y-2">
    <h3 class="text-xl font-semibold">Farming Tools</h3>
    {#if highestPriorityFarmingTool}
      <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
        <span>Active Tool:</span>
        <span class={cn(getRarityClass(highestPriorityFarmingTool.rarity ?? "", "text"))}>{highestPriorityFarmingTool.display_name}</span>
      </p>
    {/if}
  </div>
  {#each farmingTools as tool}
    <Item piece={tool} />
  {/each}
</Items>

<Collapsible.Root>
  <Collapsible.Trigger class="group flex items-center gap-0.5">
    <ChevronDown class="size-4 transition-all duration-300 group-data-[state=open]:-rotate-180" />
    Farming Crops
  </Collapsible.Trigger>
  <Collapsible.Content class="mt-4 flex flex-wrap gap-4">
    {@const crops = Object.entries(profile.farming.contests)}
    {#each crops as [_, cropData], index}
      <Chip image={{ src: cropData.texture }} animationOptions={{ animate: true, amountOfItems: crops.length, index: index }}>
        <div class="flex flex-col gap-0.5">
          <h4 class="text-lg font-semibold">{cropData.name}</h4>
          <AdditionStat text="Personal Best" data={formatNumber(cropData.collected)} />
          <AdditionStat text="Contests" data={cropData.amount.toString()} />
        </div>
      </Chip>
    {/each}
  </Collapsible.Content>
</Collapsible.Root>
