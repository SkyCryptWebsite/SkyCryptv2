<script lang="ts">
  import { getProfileContext, getSkillsContext } from "$ctx";
  import { Item as SkyblockItem } from "$lib/components/item";
  import { Chip } from "$lib/components/misc";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import Garden from "$lib/sections/stats/farming/garden.svelte";
  import { formatNumber, renderLore } from "$lib/shared/helper";
  import { animateObfuscatedText } from "$lib/shared/mc-text/obfuscated";
  import CollapsibleCustomTrigger from "$src/lib/components/CollapsibleCustomTrigger.svelte";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import * as Avatar from "$ui/avatar";
  import * as Collapsible from "$ui/collapsible";
  import * as Item from "$ui/item";
  import { Label } from "$ui/label";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import WheatIcon from "@lucide/svelte/icons/wheat";

  const openSections = true as const;
  const data = $derived(getSkillsContext().skills);
  const farming = $derived(data?.farming);
  const farmingTools = $derived(farming?.tools);
  const highestPriorityFarmingTool = $derived(farmingTools?.highest_priority_tool);
  const profileCtx = $derived(getProfileContext().current);
  const { username, profile_cute_name } = $derived(profileCtx!);
</script>

{#if farming}
  <div class="space-y-4 contents">
    <Item.Root variant="outline" class="[a]:hover:bg-foreground/10 w-fit rounded-full mx-auto hover:scale-95 [a]:transition-[scale,background-color] ease-out duration-150">
      {#snippet child({ props })}
        <a href="https://eliteskyblock.com/@{username}/{profile_cute_name}" target="_blank" {...props}>
          <Item.Media>
            <Avatar.Root class="after:rounded-none after:border-none">
              <Avatar.Image src="https://eliteskyblock.com/favicon.webp" alt="Elite" class="rounded-none" />
              <Avatar.Fallback class="bg-transparent border">EL</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title class="gap-1">For more in-depth Farming stats, check out <span class="underline text-primary inline-flex items-start gap-0.5 flex-nowrap">Elite <ExternalLinkIcon class="size-3" /></span></Item.Title>
          </Item.Content>
        </a>
      {/snippet}
    </Item.Root>
    {#if farming.pelts || farming.contestsAttended || farming.uniqueGolds}
      <div class="border p-4 rounded-xl">
        <div class="space-y-0.5">
          {#if farming.pelts}
            <AdditionStat text="Pelts" data={farming.pelts.toString()} />
          {/if}
          {#if farming.contestsAttended}
            <AdditionStat text="Contests Attended" data={farming.contestsAttended.toString()} />
          {/if}
          {#if farming.uniqueGolds}
            <AdditionStat text="Unique Golds" data={farming.uniqueGolds.toString()} maxed={farming.uniqueGolds === 10} />
          {/if}
        </div>
      </div>
    {/if}

    {#if farming.medals}
      <div class="border p-4 rounded-xl">
        <div class="space-y-0.5">
          {#each Object.entries(farming.medals) as [medal, medalData], index (index)}
            {#if medalData.total}
              <AdditionStat text={medal} data={medalData.total?.toString()} asterisk={true}>
                <div class="space-y-1">
                  {#each Object.entries(medalData) as [key, value], index (index)}
                    <Label class="gap-1 capitalize">
                      {key.replaceAll("_", " ")}:
                      <span class="font-bold">{value.toString()}</span>
                    </Label>
                  {/each}
                </div>
              </AdditionStat>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
    <div class="border p-4 rounded-xl">
      <SectionSubtitle>Farming Tools</SectionSubtitle>
      {#if farmingTools && farmingTools.tools && farmingTools.tools.length > 0}
        <div class="space-y-2">
          {#if highestPriorityFarmingTool && highestPriorityFarmingTool.display_name}
            <p class="space-x-0.5 leading-6 font-bold text-text/60 capitalize" {@attach animateObfuscatedText}>
              <span>Active Tool:</span>
              {@html renderLore(highestPriorityFarmingTool.display_name)}
            </p>
          {/if}
        </div>
        <ScrollAreaItems>
          {#each farmingTools.tools as tool, index (index)}
            <SkyblockItem piece={tool} />
          {/each}
        </ScrollAreaItems>
      {:else}
        <EmptyStat title="Farming Tools" description="This player doesn't have any farming tools" icon={WheatIcon} class="mt-2" />
      {/if}
    </div>

    {#if farming.contests}
      {#if Object.entries(farming.contests).find(([_, cropData]) => (cropData.amount ?? 0) > 0)}
        <Collapsible.Root open={openSections} class="border p-2 rounded-xl">
          <CollapsibleCustomTrigger>Farming Crops</CollapsibleCustomTrigger>
          <Collapsible.Content>
            {const crops = $derived(Object.entries(farming.contests))}

            <ScrollAreaItems>
              {#each crops as [_, cropData], index (index)}
                <Chip image={{ src: cropData.texture ?? "" }} animationOptions={{ animate: true, amountOfItems: crops.length, index: index }}>
                  <div class="flex flex-col gap-0.5 whitespace-nowrap">
                    <h4 class="text-lg font-semibold data-[maxed=true]:text-accent-2" data-maxed={cropData.maxed}>{cropData.name}</h4>
                    {#if cropData.collected != null}
                      <AdditionStat text="Personal Best" data={formatNumber(cropData.collected)} />
                    {/if}
                    {#if cropData.amount != null}
                      <AdditionStat text="Contests" data={cropData.amount.toString()} />
                    {/if}
                  </div>
                </Chip>
              {/each}
            </ScrollAreaItems>
          </Collapsible.Content>
        </Collapsible.Root>
      {/if}
    {/if}
  </div>
{:else}
  <EmptyStat title="No Data" description="This player doesn't have anything related to farming" icon={WheatIcon} />
{/if}

<Garden />
