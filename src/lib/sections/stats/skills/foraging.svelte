<script lang="ts">
  import { getSkillsContext } from "$ctx";
  import { Item } from "$lib/components/item";
  import { Chip } from "$lib/components/misc";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat } from "$lib/components/stats";
  import { renderLore } from "$lib/shared/helper";
  import { animateObfuscatedText } from "$lib/shared/mc-text/obfuscated";
  import { cn } from "$lib/shared/utils";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import AxeIcon from "@lucide/svelte/icons/axe";
  import TreePalmIcon from "@lucide/svelte/icons/tree-palm";
  import { format } from "numerable";
  import { cubicOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  const data = $derived(getSkillsContext().skills);
  const foraging = $derived(data?.foraging);
  const foragingTools = $derived(foraging?.tools);
  const highestPriorityForagingTool = $derived(foragingTools?.highest_priority_tool);
</script>

{#if foraging}
  <div class="space-y-4 contents">
    <div class="space-y-0.5 border p-4 rounded-xl">
      {#if foraging.whispers}
        <AdditionStat text="Whispers" data={format((foraging.whispers.available ?? 0) + (foraging.whispers.spent ?? 0))} asterisk={true}>
          <ul>
            {#each Object.entries(foraging.whispers) as [type, amount], index (index)}
              {#if amount != null}
                <li class="capitalize">
                  {type}:
                  <span class="font-bold">{format(amount ?? 0)}</span>
                </li>
              {/if}
            {/each}
          </ul>
        </AdditionStat>
      {/if}
      {#if foraging.hinaChapter}
        <AdditionStat text="Hina's Chapters" data="{foraging.hinaChapter.tier}/{foraging.hinaChapter.maxTier}" maxed={foraging.hinaChapter.tier === foraging.hinaChapter.maxTier} />
      {/if}
      {#if foraging.fishFamily}
        <AdditionStat text="Fish Family" data="{foraging.fishFamily.collected}/{foraging.fishFamily.total}" maxed={(foraging.fishFamily.collected ?? 0) >= (foraging.fishFamily.total ?? 0)} />
      {/if}
    </div>
    <div class="border p-4 rounded-xl">
      <SectionSubtitle>Tree Gifts</SectionSubtitle>
      {#if foraging.treeGift}
        <ScrollAreaItems>
          {#each Object.entries(foraging.treeGift) as [name, data], index (index)}
            {#if data != null}
              {const hasMaxed = data.milestone === data.maxMilestone}
              {const hasUnlocked = data.milestone}
              <Chip class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })} image={{ src: data.texture ?? "" }}>
                <div class="flex flex-col">
                  <div class="font-bold whitespace-nowrap">
                    <span class={cn("capitalize", { "text-accent-4": hasMaxed })}>{name.replaceAll("_", " ").toLowerCase()}</span>
                    <div class="text-sm">
                      <span class={cn({ "text-accent-4": hasMaxed })}>Level:</span>
                      <span class={cn({ "text-accent-4": hasMaxed })}>{format(data.milestone)}</span>
                    </div>
                  </div>
                </div>
              </Chip>
            {/if}
          {/each}
        </ScrollAreaItems>
      {:else}
        <EmptyStat title="Tree Gifts" description="This player doesn't have any tree gifts" icon={TreePalmIcon} class="mt-2" />
      {/if}
    </div>

    <div class="border p-4 rounded-xl">
      <SectionSubtitle>Foraging Tools</SectionSubtitle>
      {#if foragingTools && foragingTools.tools && foragingTools.tools.length > 0}
        <div class="space-y-2">
          {#if highestPriorityForagingTool && highestPriorityForagingTool.display_name}
            <p class="space-x-0.5 leading-6 font-bold text-foreground/60 capitalize" {@attach animateObfuscatedText}>
              <span>Active Tool:</span>
              {@html renderLore(highestPriorityForagingTool.display_name)}
            </p>
          {/if}
        </div>

        <ScrollAreaItems>
          {#each foragingTools.tools as tool, index (index)}
            <Item piece={tool} />
          {/each}
        </ScrollAreaItems>
      {:else}
        <EmptyStat title="Foraging Tools" description="This player doesn't have any foraging tools" icon={AxeIcon} class="mt-2" />
      {/if}
    </div>

    <div class="border p-4 rounded-xl">
      <SectionSubtitle>Heart of the Forest</SectionSubtitle>
      <div class="space-y-0.5">
        {#if foraging.level?.level != null}
          <AdditionStat text="Tier" data={foraging.level.level.toString()} maxed={foraging.level.level === foraging.level.maxLevel} />
        {/if}
        {#if foraging.tokens}
          <AdditionStat text="Tokens Of The Forest" data={`${foraging.tokens.spent}/${foraging.tokens.total}`} maxed={foraging.tokens.spent === foraging.tokens.total} />
        {/if}
        {#if foraging.cotf}
          <AdditionStat text="Center Of The Forest" data={`${foraging.cotf.level}/${foraging.cotf.maxLevel}`} maxed={foraging.cotf.level === foraging.cotf.maxLevel} />
        {/if}
        {#if foraging.selectedAxeAbility}
          <AdditionStat text="Axe Ability" data={foraging.selectedAxeAbility} />
        {/if}
      </div>
    </div>

    {#if foraging.hotf && foraging.hotf.length > 0}
      <ScrollAreaItems border={true} class="w-full">
        <div class="@container-normal relative mx-auto">
          <div class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 @md:gap-1.5 @xl:gap-2">
            {#each foraging.hotf as item, index (index)}
              {#if item.display_name}
                <div class="flex aspect-square items-center justify-center rounded-xl bg-foreground/5" in:fade|global={{ duration: 300, delay: 5 * (index + 1), easing: cubicOut }}>
                  <Item piece={item} isInventory={true} />
                </div>
              {:else}
                <div class="aspect-square rounded-xl bg-foreground/5" in:fade|global={{ duration: 300, delay: 5 * (index + 1), easing: cubicOut }}></div>
              {/if}
            {/each}
          </div>
        </div>
      </ScrollAreaItems>
    {/if}
  </div>
{:else}
  <EmptyStat title="No Data" description="This player doesn't have anything related to foraging" icon={AxeIcon} />
{/if}
