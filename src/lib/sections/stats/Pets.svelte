<script lang="ts">
    import AdditionStat from "$lib/components/AdditionStat.svelte";
    import Item from "$lib/components/Item.svelte";
    import Items from "$lib/layouts/stats/Items.svelte";
    import type { FullProfile, Item as ItemType } from "$lib/types/globals";
    import _ from "lodash";
    import { getContext } from "svelte";
    import { Collapsible } from "bits-ui";
    import { RARITY_COLORS } from "$constants/items";
    import { getRarityClass } from "$lib/tools";
    import { cn } from "$lib/utils";
    import { PET_REWARDS } from "$lib/constants/pets";
    //import { formatNumber } from "$lib/helper";
  
    const profile = getContext<FullProfile>("profile");
  
    // @ts-ignore We're gonna need to fix these type errors later by redoing the types
    const pets = profile.data.pets;
</script>

<Items title="Pets">
  <div slot="text">
    <AdditionStat text="Unique Pets" data={`${pets.amount_pets} / ${pets.total_pets}`} />
    <AdditionStat text="Unique Pet Skins" data={`${pets.amount_pet_skins} / ${pets.total_pet_skins}`} />
    <AdditionStat text="Pet Score" data={`${pets.pet_score.total} (+${pets.pet_score.bonus.magic_find} MF) `} asterisk={true}>
      <div class="max-w-xs space-y-2 font-bold">
        <h3 class="text-text/85">Pet score is calculated based on how many unique pets you have and the rarity of these pets.</h3>
        <br />
        <h3 class="text-text/85">You gain an additional score for each max level pet you have!</h3>
        <br />
        <table>
          {#each Object.entries(PET_REWARDS) as [score, data]}
            <tr>
              <tr><td>{score} Score: </td><td><span style="color: var(--§b)">+{data.magic_find} Magic Find</span>
                
                {#if data.magic_find === pets.pet_score.amount}
                  <span style='color: var(--§5);'> «</span>
                {/if}
  
                </td>
            </tr>
          {/each}
        </table>
      </div>
    </AdditionStat>
    <AdditionStat text="Total Candies Used" data={`${pets.total_candy_used}`} />
    <!-- will format later on after we fix canvas errors -->
    <AdditionStat text="Total Pet XP" data={`${pets.total_pet_xp}`} />
  </div>
  <Items subtitle="Active Pet">
    {@const activePet = pets.pets.find(pet => pet.active === true)}
    {#if activePet !== undefined}
      <div>
        <div class="flex items-center">
          <Item piece={activePet} />
          <div class="ml-4 flex flex-col justify-center">
            <h4 class="text-xl capitalize text-text" style="color: var(--§{RARITY_COLORS[activePet.rarity ?? 7]})">{activePet.rarity} {activePet.display_name}</h4>
            <h4 class="text-xl capitalize text-text">Level {activePet.level.level}</h4>
          </div>
        </div>
        <p class="mt-3 space-x-0.5 capitalize text-text/60">
          <span>Bonus:</span>
          <!-- TODO: Add bonus -->
          <span class={cn(getRarityClass(activePet.rarity ?? "common", "text"))}>TODO: Add bonus</span>
        </p>
      </div>
    {/if}
  </Items>
  {@const uniquePets = _.uniqBy(pets.pets, 'type')}
  {@const otherPets = pets.pets.filter(pet => !uniquePets.includes(pet))}
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
</Items>
