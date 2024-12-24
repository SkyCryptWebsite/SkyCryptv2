<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Bonus from "$lib/components/Bonus.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  // import { PET_REWARDS } from "$lib/server/constants/pets";
  /*
  <!-- TODO: Format this on the back end -->
  {#each Object.entries(PET_REWARDS) as [score, data]}
    <div>
      {score} Score: <span style="color: var(--§b)">+{data.magic_find} Magic Find</span>
      {#if data.magic_find === pets.petScore.amount}
        <span style="color: var(--§5);"> «</span>
      {/if}
    </div>
  {/each}
  */

  import { formatNumber, getRarityClass, uniqBy } from "$lib/shared/helper";
  import { cn } from "$lib/shared/utils";
  import type { ValidStats as StatsType } from "$lib/types/stats";
  import { Collapsible } from "bits-ui";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");
  const pets = profile.pets;
  const activePet = pets.pets.find((pet) => pet.active === true);
  const uniquePets = uniqBy(pets.pets, "type");
  const otherPets = pets.pets.filter((pet) => !uniquePets.includes(pet));

  // TODO: Once helper functions get moved to a global location, we can remove this function
</script>

{#if pets != null}
  <Items title="Pets">
    <div slot="text">
      <AdditionStat text="Unique Pets" data={`${pets.amount} / ${pets.total}`} maxed={pets.amount === pets.total} />
      <AdditionStat text="Unique Pet Skins" data={`${pets.amountSkins} / ${pets.totalSkins}`} maxed={pets.amountSkins === pets.totalSkins} />
      {#if pets.petScore != null}
        <AdditionStat text="Pet Score" data={`${pets.petScore.amount} (+${pets.petScore.stats.magic_find} MF) `} asterisk={true}>
          <div class="max-w-xs space-y-6 font-bold">
            <h3 class="text-text/85">Pet score is calculated based on how many unique pets you have and the rarity of these pets.</h3>
            <h3 class="text-text/85">You gain an additional score for each max level pet you have!</h3>
            <div class="flex flex-col"></div>
          </div>
        </AdditionStat>
      {/if}
      <AdditionStat text="Total Candies Used" data={pets.totalCandyUsed} maxed={pets.totalCandyUsed === 0} />
      <AdditionStat text="Total Pet XP" data={formatNumber(pets.totalPetExp)} />
    </div>
    <div>
      {#if activePet != null}
        <Items subtitle="Active Pet">
          <div>
            <div class="flex items-center">
              <Item piece={activePet} />
              <div class="ml-4 flex flex-col justify-center">
                <h4 class={cn(getRarityClass(activePet.rarity ?? "", "text"), "text-xl font-bold capitalize")}>{activePet.rarity.toLowerCase()} {activePet.type.toLowerCase()}</h4>
                <h4 class="text-xl font-medium capitalize text-text">Level {activePet.level.level}</h4>
              </div>
            </div>
            <Bonus stats={activePet.stats} class="mt-3" />
          </div>
        </Items>

        {#if uniquePets.length > 0 && uniquePets.find((pet) => !pet.active)}
          <Items subtitle="Other Pets">
            {#each uniquePets as pet}
              {#if !pet.active}
                <div>
                  <Item piece={pet} />
                  <p class="mt-2 text-center font-semibold">LVL {pet.level.level}</p>
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
                <p class="mt-2 text-center font-semibold">LVL {pet.level.level}</p>
              </div>
            {/if}
          {/each}
        </Items>
      {/if}

      {#if otherPets.length > 0}
        <Collapsible.Root>
          <Collapsible.Trigger class="group flex items-center gap-0.5 pt-4">
            <ChevronDown class="size-6 transition-all duration-300 group-data-[state=open]:-rotate-180" />
            <h4 class="text-xl font-semibold capitalize text-text">Show More Pets</h4>
          </Collapsible.Trigger>
          <Collapsible.Content class="mt-4 flex flex-wrap gap-4">
            <Items>
              {#each otherPets as pet}
                <div>
                  <Item piece={pet} />
                  <p class="mt-2 text-center font-semibold">LVL {pet.level.level}</p>
                </div>
              {/each}
            </Items>
          </Collapsible.Content>
        </Collapsible.Root>
      {/if}

      {#if pets.missing.length > 0}
        <Collapsible.Root>
          <Collapsible.Trigger class="group flex items-center gap-0.5 pt-4">
            <ChevronDown class="size-6 transition-all duration-300 group-data-[state=open]:-rotate-180" />
            <h4 class="text-xl font-semibold capitalize text-text">Missing Pets</h4>
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
{/if}
