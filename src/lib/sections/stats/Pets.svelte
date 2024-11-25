<script lang="ts">
  import { RARITY_COLORS } from "$constants/items";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Bonus from "$lib/components/Bonus.svelte";
  import Item from "$lib/components/Item.svelte";
  import { PET_REWARDS } from "$lib/constants/pets";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { Collapsible } from "bits-ui";
  import { getContext } from "svelte";
  //import { formatNumber } from "$lib/helper";

  const profile = getContext<StatsType>("profile");

  // TODO: Once helper functions get moved to a global location, we can remove this function
  function uniqBy<T>(arr: T[], key: string) {
    const seen = new Set();
    return arr.filter((item) => {
      const k = (item as Record<string, unknown>)[key];
      return seen.has(k) ? false : seen.add(k);
    });
  }

  const pets = profile.pets;
</script>

<Items title="Pets">
  <div slot="text">
    <AdditionStat text="Unique Pets" data={`${pets.amount} / ${pets.total}`} />
    <AdditionStat text="Unique Pet Skins" data={`${pets.amountSkins} / ${pets.totalSkins}`} />
    <AdditionStat text="Pet Score" data={`${pets.petScore.amount} (+${pets.petScore.stats.magic_find} MF) `} asterisk={true}>
      <div class="max-w-xs space-y-6 font-bold">
        <h3 class="text-text/85">Pet score is calculated based on how many unique pets you have and the rarity of these pets.</h3>
        <h3 class="text-text/85">You gain an additional score for each max level pet you have!</h3>
        <div class="flex flex-col">
          {#each Object.entries(PET_REWARDS) as [score, data]}
            <div>
              {score} Score: <span style="color: var(--§b)">+{data.magic_find} Magic Find</span>
              {#if data.magic_find === pets.petScore.amount}
                <span style="color: var(--§5);"> «</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </AdditionStat>
    <AdditionStat text="Total Candies Used" data={`${pets.totalCandyUsed}`} />
    <!-- will format later on after we fix canvas errors -->
    <AdditionStat text="Total Pet XP" data={`${pets.totalPetExp}`} />
  </div>
  <Items subtitle="Active Pet">
    {@const activePet = pets.pets.find((pet) => pet.active === true)}
    {#if activePet !== undefined}
      <div>
        <div class="flex items-center">
          <Item piece={activePet} />
          <div class="ml-4 flex flex-col justify-center">
            <h4 class="text-xl capitalize text-text" style="color: var(--§{RARITY_COLORS[activePet.rarity ?? 7]})">{activePet.rarity} {activePet.display_name}</h4>
            <h4 class="text-xl capitalize text-text">Level {activePet.level.level}</h4>
          </div>
        </div>
        <Bonus stats={activePet.stats} class="mt-3" />
      </div>
    {/if}
  </Items>
  {@const uniquePets = uniqBy(pets.pets, "type")}
  {@const otherPets = pets.pets.filter((pet) => !uniquePets.includes(pet))}

  <Items subtitle="Other Pets">
    {#each uniquePets as pet}
      {#if !pet.active}
        <div>
          <Item piece={pet} />
          <p class="mt-2 text-center">LVL {pet.level.level}</p>
        </div>
      {/if}
    {/each}
  </Items>

  {#if otherPets.length > 0 || pets.missing.length > 0}
    <div>
      {#if otherPets.length > 0}
        <Collapsible.Root>
          <Collapsible.Trigger>
            <h4 class="text-xl capitalize text-text">Show More Pets</h4>
            <br />
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Items>
              {#each otherPets as pet}
                <div>
                  <Item piece={pet} />
                  <p class="mt-2 text-center">LVL {pet.level.level}</p>
                </div>
              {/each}
            </Items>
          </Collapsible.Content>
        </Collapsible.Root>
      {/if}
      {#if pets.missing.length > 0}
        <Collapsible.Root>
          <Collapsible.Trigger>
            <h4 class="text-xl capitalize text-text">Missing Pets</h4>
            <br />
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Items>
              {#each pets.missing as pet}
                <div>
                  <Item piece={pet} />
                </div>
              {/each}
            </Items>
          </Collapsible.Content>
        </Collapsible.Root>
      {/if}
    </div>
  {/if}
</Items>
