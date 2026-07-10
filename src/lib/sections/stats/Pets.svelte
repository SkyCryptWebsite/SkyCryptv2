<script lang="ts">
  import { Item } from "$components/item";
  import ScrollAreaItems from "$components/ScrollAreaItems.svelte";
  import { Section, SectionSubtitle } from "$components/sections";
  import { AdditionStat, Bonus } from "$components/stats";
  import { getCombinedContext } from "$ctx";
  import { formatNumber, getRarityClass, renderLore, uniqBy } from "$lib/shared/helper";
  import { animateObfuscatedText } from "$lib/shared/mc-text/obfuscated";
  import { cn } from "$lib/shared/utils";
  import CollapsibleCustomTrigger from "$src/lib/components/CollapsibleCustomTrigger.svelte";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import { type ModelsStrippedPet } from "$src/lib/shared/api/orval-generated";
  import * as Collapsible from "$ui/collapsible";
  import { Label } from "$ui/label";
  import PawPrintIcon from "@lucide/svelte/icons/paw-print";

  let { order }: { order: number } = $props();

  const pets = $derived(getCombinedContext().current?.pets);

  const activePet = $derived(pets?.pets?.find((pet) => pet.active === true));
  const uniquePets = $derived(uniqBy(pets?.pets ?? [], "type"));
  const otherPets = $derived((pets?.pets ?? []).filter((pet) => !uniquePets.includes(pet)));
  const hasInactiveUniquePets = $derived(uniquePets.some((pet) => !pet.active));
</script>

{#snippet petCard(pet: ModelsStrippedPet)}
  <div>
    <Item piece={pet} />
    <p class="mt-2 text-center font-semibold data-[maxed=true]:text-accent-2" data-maxed={pet.level === pet.maxLevel}>LVL {pet.level}</p>
  </div>
{/snippet}

<Section id="Pets" {order}>
  {#if pets}
    {#if pets.pets?.length}
      <div class="space-y-4 contents">
        <div class="border rounded-xl p-4">
          <AdditionStat text="Unique Pets" data="{pets.amount} / {pets.total}" maxed={pets.amount === pets.total} />
          {#if pets.amountSkins}
            <AdditionStat text="Unique Pet Skins" data={pets.amountSkins} />
          {/if}
          {#if pets.petScore != null}
            <AdditionStat text="Pet Score" data={`${pets.petScore.amount} (+${pets.petScore.stats?.magic_find} MF) `} asterisk={true}>
              <div class="max-w-xs space-y-4">
                <Label class="font-bold">Pet Score</Label>
                <h3 class="text-foreground">Pet score is calculated based on how many unique pets you have and the rarity of these pets.</h3>
                <h3 class="text-foreground">You gain an additional score for each max level pet you have!</h3>
                <div class="flex flex-col">
                  {#each pets.petScore.reward?.toReversed() as { score, bonus, unlocked }, index (index)}
                    <div class="group data-[unlocked=true]:font-bold text-foreground/80 group data-[unlocked=true]:text-foreground" data-unlocked={unlocked}>
                      {score} Score: <span class="group-data-[unlocked=true]:text-minecraft-b text-minecraft-b/80">+{bonus} Magic Find</span>
                      {#if unlocked}
                        <span class="text-minecraft-5"> «</span>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            </AdditionStat>
          {/if}
          {#if pets.totalCandyUsed != null}
            <AdditionStat text="Total Candies Used" data={pets.totalCandyUsed} maxed={pets.totalCandyUsed === 0} />
          {/if}
          {#if pets.totalPetExp != null}
            <AdditionStat text="Total Pet XP" data={formatNumber(pets.totalPetExp)} />
          {/if}
        </div>

        {#if activePet != null}
          <div class="border rounded-xl p-4">
            <SectionSubtitle>Active Pet</SectionSubtitle>
            {#if activePet.stats}
              <Bonus stats={activePet.stats} />
            {/if}
            <div class="flex items-center mt-4">
              <Item piece={activePet} />
              <div class="ml-4 flex flex-col justify-center">
                <h4 class={cn(getRarityClass(activePet.rarity ?? "common", "text"), "text-xl font-bold capitalize")} {@attach animateObfuscatedText}>{(activePet.rarity ?? "common").toLowerCase()} {@html renderLore((activePet.display_name ?? "").toLowerCase())}</h4>
                <h4 class="text-xl font-medium text-foreground capitalize">Level {activePet.level}</h4>
              </div>
            </div>
          </div>
        {/if}

        {#if hasInactiveUniquePets}
          <div class="border rounded-xl p-4">
            <SectionSubtitle class="mt-0">Other Pets</SectionSubtitle>

            <ScrollAreaItems>
              {#each uniquePets as pet, index (index)}
                {#if !pet.active}
                  {@render petCard(pet)}
                {/if}
              {/each}
            </ScrollAreaItems>
          </div>
        {/if}

        {#if otherPets && otherPets.length > 0}
          <Collapsible.Root class="p-2 rounded-xl border">
            <CollapsibleCustomTrigger>Show More Pets</CollapsibleCustomTrigger>
            <Collapsible.Content class="px-2">
              <ScrollAreaItems>
                {#each otherPets as pet, index (index)}
                  {@render petCard(pet)}
                {/each}
              </ScrollAreaItems>
            </Collapsible.Content>
          </Collapsible.Root>
        {/if}

        {#if pets.missing && pets.missing.length > 0}
          <Collapsible.Root class="p-2 rounded-xl border">
            <CollapsibleCustomTrigger>Missing Pets</CollapsibleCustomTrigger>
            <Collapsible.Content class="px-2">
              <ScrollAreaItems>
                {#each pets.missing as pet, index (index)}
                  <div class="grayscale-80 hover:grayscale-0">
                    <Item piece={pet} />
                  </div>
                {/each}
              </ScrollAreaItems>
            </Collapsible.Content>
          </Collapsible.Root>
        {/if}
      </div>
    {:else}
      <EmptyStat title="No Pets" description="This player doesn't have any pets" icon={PawPrintIcon} />
    {/if}
  {:else}
    <EmptyStat title="No Pets" description="This player doesn't have any pets" icon={PawPrintIcon} />
  {/if}
</Section>
