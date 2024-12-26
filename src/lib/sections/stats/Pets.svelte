<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Bonus from "$lib/components/Bonus.svelte";
  import Item from "$lib/components/Item.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";

  import { getProfileCtx } from "$ctx/profile.svelte";
  import { formatNumber, getRarityClass, uniqBy } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import { Collapsible } from "bits-ui";
  import ChevronDown from "lucide-svelte/icons/chevron-down";

  const { profile } = getProfileCtx();
  const pets = $derived(profile.pets);
  const activePet = $derived(pets.pets.find((pet) => pet.active === true));
  const uniquePets = $derived(uniqBy(pets.pets, "type"));
  const otherPets = $derived(pets.pets.filter((pet) => !uniquePets.includes(pet)));
</script>

{#if pets.pets?.length}
  <Items title="Pets">
    <div slot="text">
      <AdditionStat text="Unique Pets" data={`${pets.amount} / ${pets.total}`} maxed={pets.amount === pets.total} />
      <AdditionStat text="Unique Pet Skins" data={`${pets.amountSkins} / ${pets.totalSkins}`} maxed={pets.amountSkins === pets.totalSkins} />
      {#if pets.petScore != null}
        <AdditionStat text="Pet Score" data={`${pets.petScore.amount} (+${pets.petScore.stats.magic_find} MF) `} asterisk={true}>
          <div class="max-w-xs space-y-6 font-bold">
            <h3 class="text-text/85">Pet score is calculated based on how many unique pets you have and the rarity of these pets.</h3>
            <h3 class="text-text/85">You gain an additional score for each max level pet you have!</h3>
            <div class="flex flex-col">
              {#each pets.petScore.reward as { score, bonus, unlocked }}
                <div>
                  {score} Score: <span style="color: var(--§b)">+{bonus} Magic Find</span>
                  {#if unlocked}
                    <span style="color: var(--§5);"> «</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </AdditionStat>
      {/if}
      <AdditionStat text="Total Candies Used" data={pets.totalCandyUsed} maxed={pets.totalCandyUsed === 0} />
      <AdditionStat text="Total Pet XP" data={formatNumber(pets.totalPetExp)} />
    </div>
    <div class="mb-4">
      {#if activePet != null}
        <SectionSubtitle class="mt-2">Active Pet</SectionSubtitle>
        <Items>
          <div>
            <div class="flex items-center">
              <Item piece={activePet} />
              <div class="ml-4 flex flex-col justify-center">
                <h4 class={cn(getRarityClass(activePet.rarity ?? "common", "text"), "text-xl font-bold capitalize")}>{(activePet.rarity ?? "common").toLowerCase()} {activePet.display_name.toLowerCase()}</h4>
                <h4 class="text-xl font-medium capitalize text-text">Level {activePet.level}</h4>
              </div>
            </div>
            <Bonus stats={activePet.stats} class="my-2" />
          </div>
        </Items>

        {#if uniquePets.length > 0 && uniquePets.find((pet) => !pet.active)}
          <SectionSubtitle class="mt-0">Other Pets</SectionSubtitle>
          <Items>
            {#each uniquePets as pet}
              {#if !pet.active}
                <div>
                  <Item piece={pet} />
                  <p class="mt-2 text-center font-semibold">LVL {pet.level}</p>
                </div>
              {/if}
            {/each}
          </Items>
        {/if}
      {:else}
        <Items>
          {#each uniquePets as pet}
            {#if !pet.active}
              <div>
                <Item piece={pet} />
                <p class="mt-2 text-center font-semibold">LVL {pet.level}</p>
              </div>
            {/if}
          {/each}
        </Items>
      {/if}

      {#if otherPets.length > 0}
        <Collapsible.Root>
          <Collapsible.Trigger class="group flex items-center gap-0.5 pt-1.5">
            <ChevronDown class="size-5 transition-all duration-300 group-data-[state=open]:-rotate-180" />
            <SectionSubtitle class="my-0">Show More Pets</SectionSubtitle>
          </Collapsible.Trigger>
          <Collapsible.Content class="mt-4 flex flex-wrap gap-4">
            <Items>
              {#each otherPets as pet}
                <div>
                  <Item piece={pet} />
                  <p class="mt-2 text-center font-semibold">LVL {pet.level}</p>
                </div>
              {/each}
            </Items>
          </Collapsible.Content>
        </Collapsible.Root>
      {/if}

      {#if pets.missing.length > 0}
        <Collapsible.Root>
          <Collapsible.Trigger class="group flex items-center gap-0.5 pt-5">
            <ChevronDown class="size-5 transition-all duration-300 group-data-[state=open]:-rotate-180" />
            <SectionSubtitle class="my-0">Missing Pets</SectionSubtitle>
          </Collapsible.Trigger>
          <Collapsible.Content class="mt-4 flex flex-wrap gap-4">
            <Items>
              {#each pets.missing as pet}
                <div class="grayscale-[80%] hover:grayscale-0">
                  <Item piece={pet} />
                </div>
              {/each}
            </Items>
          </Collapsible.Content>
        </Collapsible.Root>
      {/if}
    </div>
  </Items>
{:else}
  <Items title="Pets">
    <p class="text-text/60">No data available</p>
  </Items>
{/if}
