<script lang="ts">
  import { getProfileContext, getSkillsContext } from "$ctx";
  import { Chip } from "$lib/components/misc";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat, SkillGear } from "$lib/components/stats";
  import Garden from "$lib/sections/stats/farming/garden.svelte";
  import { formatNumber } from "$lib/shared/helper";
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
  const profileCtx = $derived(getProfileContext().current);
  const { username, profile_cute_name } = $derived(profileCtx!);
</script>

{#if farming}
  <div class="contents space-y-4">
    <Item.Root
      variant="outline"
      class="mx-auto w-fit rounded-full duration-150 ease-out interact:scale-95 [a]:transition-[scale,background-color] [a]:interact:bg-foreground/10">
      {#snippet child({ props })}
        <a
          href="https://eliteskyblock.com/@{username}/{profile_cute_name}?utm_source=SkyCrypt&utm_campaign=Farming"
          target="_blank"
          {...props}>
          <Item.Media>
            <Avatar.Root class="after:rounded-none after:border-none">
              <Avatar.Image src="https://eliteskyblock.com/favicon.webp" alt="Elite" class="rounded-none" />
              <Avatar.Fallback class="border bg-transparent">EL</Avatar.Fallback>
            </Avatar.Root>
          </Item.Media>
          <Item.Content>
            <Item.Title class="gap-1"
              >For more in-depth Farming stats, check out <span
                class="inline-flex flex-nowrap items-start gap-0.5 text-primary underline"
                >Elite <ExternalLinkIcon class="size-3" /></span
              ></Item.Title>
          </Item.Content>
        </a>
      {/snippet}
    </Item.Root>
    {#if farming.pelts || farming.contestsAttended || farming.uniqueGolds}
      <div class="rounded-xl border p-4">
        <div class="space-y-0.5">
          {#if farming.pelts}
            <AdditionStat text="Pelts" data={farming.pelts.toString()} />
          {/if}
          {#if farming.contestsAttended}
            <AdditionStat text="Contests Attended" data={farming.contestsAttended.toString()} />
          {/if}
          {#if farming.uniqueGolds}
            <AdditionStat
              text="Unique Golds"
              data={farming.uniqueGolds.toString()}
              maxed={farming.uniqueGolds === 10} />
          {/if}
        </div>
      </div>
    {/if}

    {#if farming.medals}
      <div class="rounded-xl border p-4">
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
    <div class="space-y-4 rounded-xl border p-4">
      <SectionSubtitle>Farming Gear</SectionSubtitle>
      <SkillGear gear={farming.gear} skill="farming" />
    </div>

    {#if farming.contests}
      {#if Object.entries(farming.contests).find(([_, cropData]) => (cropData.amount ?? 0) > 0)}
        <Collapsible.Root open={openSections} class="rounded-xl border p-2">
          <CollapsibleCustomTrigger>Farming Crops</CollapsibleCustomTrigger>
          <Collapsible.Content>
            {const crops = $derived(Object.entries(farming.contests))}

            <ScrollAreaItems>
              {#each crops as [_, cropData], index (index)}
                <Chip
                  image={{ src: cropData.texture ?? "" }}
                  animationOptions={{ animate: true, amountOfItems: crops.length, index: index }}>
                  <div class="flex flex-col gap-0.5 whitespace-nowrap">
                    <h4 class="text-lg font-semibold data-[maxed=true]:text-accent-2" data-maxed={cropData.maxed}>
                      {cropData.name}
                    </h4>
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
