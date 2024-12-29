<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Item from "$lib/components/Item.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { formatNumber, renderLore } from "$lib/shared/helper";
  import { Collapsible } from "bits-ui";
  import ChevronDown from "lucide-svelte/icons/chevron-down";

  const { profile } = getProfileCtx();

  const highestPriorityFarmingTool = $derived(profile.items.farming_tools.highest_priority_tool);
  const farmingTools = $derived(profile.items.farming_tools.tools);
</script>

<SectionSubtitle>Farming</SectionSubtitle>
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
    <AdditionStat text="Unique Golds" data={profile.farming.uniqueGolds.toString()} maxed={profile.farming.uniqueGolds === 10} />
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

<SectionSubtitle>Farming Tools</SectionSubtitle>
{#if farmingTools.length > 0}
  <Items>
    <div slot="text" class="space-y-2">
      {#if highestPriorityFarmingTool && highestPriorityFarmingTool.display_name}
        <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
          <span>Active Tool:</span>
          {@html renderLore(highestPriorityFarmingTool.display_name)}
        </p>
      {/if}
    </div>
    {#each farmingTools as tool}
      <Item piece={tool} />
    {/each}
  </Items>
{:else}
  <p class="space-x-0.5 leading-6">{profile.username} doesn't have any farming tools.</p>
{/if}

{#if Object.entries(profile.farming.contests).find(([_, cropData]) => cropData.amount > 0)}
  <Collapsible.Root class="mt-5">
    <Collapsible.Trigger class="group flex items-center gap-0.5">
      <ChevronDown class="size-5 transition-all duration-300 group-data-[state=open]:-rotate-180" />
      <SectionSubtitle class="my-0">Farming Crops</SectionSubtitle>
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
{/if}
