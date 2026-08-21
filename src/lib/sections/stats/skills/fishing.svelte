<script lang="ts">
  import { getSkillsContext } from "$ctx";
  import { Chip } from "$lib/components/misc";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat, SkillGear } from "$lib/components/stats";
  import { renderLore, titleCase } from "$lib/shared/helper";
  import { animateObfuscatedText } from "$lib/shared/mc-text/obfuscated";
  import CollapsibleCustomTrigger from "$src/lib/components/CollapsibleCustomTrigger.svelte";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import { type ModelsKill } from "$src/lib/shared/api/orval-generated";
  import * as Collapsible from "$ui/collapsible";
  import { Separator } from "$ui/separator";
  import FishIcon from "@lucide/svelte/icons/fish";
  import Image from "@lucide/svelte/icons/image";
  import { Avatar } from "bits-ui";
  import { format } from "numerable";

  type ColorSchema = Record<(typeof tiers)[number], { bg: string; text: string }>;

  const openSections = true as const;
  const tiers = ["diamond", "gold", "silver", "bronze"] as const;
  const colors = {
    bronze: {
      bg: "bg-[oklch(55.23%_0.1295_59.21)]",
      text: "text-[oklch(55.23%_0.1295_59.21)]/80"
    },
    silver: {
      bg: "bg-[oklch(77.02%_0.0014_286.37)]",
      text: "text-[oklch(77.02%_0.0014_286.37)]/80"
    },
    gold: {
      bg: "bg-[oklch(82.61%_0.1706_80.88)]",
      text: "text-[oklch(82.61%_0.1706_80.88)]/80"
    },
    diamond: {
      bg: "bg-[oklch(87.66%_0.1178_208.16)]",
      text: "text-[oklch(87.66%_0.1178_208.16)]/80"
    }
  } satisfies ColorSchema;

  const data = $derived(getSkillsContext().skills);
  const fishing = $derived(data?.fishing);
</script>

{#if fishing}
  <div class="contents space-y-4">
    <div class="rounded-xl border p-4">
      <div class="space-y-0.5">
        <AdditionStat text="Items Fished" data={format(fishing.itemsFished)} />
        <AdditionStat text="Treasures Fished" data={format(fishing.treasure)} />
        <AdditionStat text="Large Treasures Fished" data={format(fishing.treasureLarge)} />
        <AdditionStat text="Sea Creatures Killed" data={format(fishing.seaCreaturesFished)} />
        {#if fishing.trophyFish}
          <AdditionStat text="Trophy Fish Fished" data={format(fishing.trophyFish.totalCaught)} />
        {/if}
      </div>
    </div>

    <div class="space-y-4 rounded-xl border p-4">
      <SectionSubtitle>Fishing Gear</SectionSubtitle>
      <SkillGear gear={fishing.gear} skill="fishing" />
    </div>

    {#if fishing.waterSeaCreatures}
      {#if Object.entries(fishing.waterSeaCreatures).find(([_, waterSeaCreature]) => (waterSeaCreature.amount ?? 0) > 0)}
        {@render creaturesDisplay("Sea Creatures", fishing.waterSeaCreatures)}
      {/if}
    {/if}

    {#if fishing.lavaSeaCreatures}
      {#if Object.entries(fishing.lavaSeaCreatures).find(([_, lavaSeaCreature]) => (lavaSeaCreature.amount ?? 0) > 0)}
        {@render creaturesDisplay("Lava Sea Creatures", fishing.lavaSeaCreatures)}
      {/if}
    {/if}

    {#if fishing.trophyFish != null && (fishing.trophyFish.totalCaught ?? 0) > 0}
      <Collapsible.Root open={openSections} class="rounded-xl border p-2">
        <CollapsibleCustomTrigger>Trophy Fish</CollapsibleCustomTrigger>
        <Collapsible.Content>
          <div class="space-y-0.5">
            {#if fishing.trophyFish}
              <AdditionStat text="Total Caught" data={format(fishing.trophyFish.totalCaught)} />
              {#if fishing.trophyFish.stage && fishing.trophyFish.stage.name}
                <AdditionStat text="Current Stage" data={fishing.trophyFish.stage.name} asterisk={true}>
                  <ul>
                    {#each fishing.trophyFish.stage.progress as tier, index (index)}
                      {#if tier.tier}
                        <li>
                          {titleCase(tier.tier)}:
                          <span class="font-bold">{tier.caught} / {tier.total}</span>
                        </li>
                      {/if}
                    {/each}
                  </ul>
                </AdditionStat>
              {/if}
            {/if}
          </div>

          {#if fishing.trophyFish && fishing.trophyFish.trophyFish}
            {const trophyFishes = Object.entries(fishing.trophyFish.trophyFish)}
            <Separator class="mt-2" />

            <ScrollAreaItems>
              {#each trophyFishes as [_, trophyFish], index (index)}
                {const highestTier = tiers.find((tier) => (trophyFish[tier] ?? 0) > 0)}
                {const highestTierColor = highestTier ? colors[highestTier].text : "text-muted-foreground"}
                <Chip class="px-4 whitespace-nowrap" image={{ src: trophyFish.texture ?? "" }}>
                  <div class="flex flex-col">
                    <div class="flex flex-col gap-0.5">
                      <h4 class="font-bold {highestTierColor}">
                        {trophyFish.name}
                        <span class="font-medium text-foreground/70"
                          >x{format(
                            (trophyFish.bronze ?? 0) +
                              (trophyFish.silver ?? 0) +
                              (trophyFish.gold ?? 0) +
                              (trophyFish.diamond ?? 0)
                          )}</span>
                      </h4>
                    </div>
                    <div class="grid grid-cols-2 grid-rows-2">
                      <div class="flex items-center gap-1">
                        <div class="size-4 rounded-full {colors.bronze.bg}"></div>
                        {format(trophyFish.bronze)}
                      </div>
                      <div class="flex items-center gap-1">
                        <div class="size-4 rounded-full {colors.silver.bg}"></div>
                        {format(trophyFish.silver)}
                      </div>
                      <div class="flex items-center gap-1">
                        <div class="size-4 rounded-full {colors.gold.bg}"></div>
                        {format(trophyFish.gold)}
                      </div>
                      <div class="flex items-center gap-1">
                        <div class="size-4 rounded-full {colors.diamond.bg}"></div>
                        {format(trophyFish.diamond)}
                      </div>
                    </div>
                  </div>
                  {#snippet tooltip()}
                    {#if trophyFish.description}
                      <div class="contents" {@attach animateObfuscatedText}>
                        {@html renderLore(trophyFish.description, true, undefined, { breakSpaces: true })}
                      </div>
                    {/if}
                  {/snippet}
                </Chip>
              {/each}
            </ScrollAreaItems>
          {/if}
        </Collapsible.Content>
      </Collapsible.Root>
    {/if}
  </div>
{:else}
  <EmptyStat
    title="No Data"
    description="This player doesn't have anything related to fishing"
    icon={FishIcon}
    class="mt-2" />
{/if}

{#snippet creaturesDisplay(title: string, creaturesList: ModelsKill[])}
  <Collapsible.Root open={openSections} class="rounded-xl border p-2">
    <CollapsibleCustomTrigger>{title}</CollapsibleCustomTrigger>

    <Collapsible.Content>
      {const creatures = Object.entries(creaturesList)}
      <ScrollAreaItems>
        {#each creatures as [_, creature], index (index)}
          <div class="flex h-full max-h-56 flex-col rounded-xl bg-background/30 p-2 whitespace-nowrap">
            <div class="flex h-12 items-center justify-center border-b-2 border-primary pb-2 text-center font-bold">
              {creature.name}
            </div>
            <div class="mt-2 flex h-full w-full flex-col items-center justify-center gap-4">
              <Avatar.Root class="flex items-center justify-center">
                <Avatar.Image loading="lazy" src={creature.texture} class="aspect-square size-24 object-contain" />
                <Avatar.Fallback>
                  <Image class="size-24" />
                </Avatar.Fallback>
              </Avatar.Root>
              <div class="text-center font-bold">
                {creature.amount} <span class="text-muted-foreground">Kills</span>
              </div>
            </div>
          </div>
        {/each}
      </ScrollAreaItems>
    </Collapsible.Content>
  </Collapsible.Root>
{/snippet}
