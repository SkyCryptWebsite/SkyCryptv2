<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { getRarityClass } from "$lib/tools";
  import { cn } from "$lib/utils";
  import type { Stats as StatsType } from "$types/stats";
  import { formatDate, formatDistanceStrict } from "date-fns";
  import { format } from "numerable";
  import { getContext } from "svelte";
  import { fade } from "svelte/transition";

  const profile = getContext<StatsType>("profile");

  const highestPriorityMiningTool = profile.items.mining_tools.highest_priority_tool;
  const miningTools = profile.items.mining_tools.tools;
</script>

<Items title="Skills">
  <div slot="text" class="space-y-2">
    <h3 class="text-xl font-semibold">Mining Tools</h3>
    <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
      <span>Active Tool:</span>
      <span class={cn(getRarityClass(highestPriorityMiningTool.rarity ?? "", "text"))}>{highestPriorityMiningTool.display_name}</span>
    </p>
  </div>
  {#each miningTools as tool}
    <Item piece={tool} />
  {/each}
</Items>

<h3 class="text-xl font-semibold">Dwarven Mines & Crystal Hollows</h3>
<div class="space-y-0.5">
  <AdditionStat text="Commissions Milestone" data={profile.mining.commissions.milestone.toString()} />
  <AdditionStat text="Commissions" data={profile.mining.commissions.completions.toString()} asterisk={true}>Commissions from achievements across profiles</AdditionStat>
  <AdditionStat text="Crystal Hollows Pass" data={profile.mining.crystalHollows.crystalHollowsLastAccess > Date.now() - 5 * 60 * 60 * 1000 ? "Purchased" : "Expired"} asterisk={true}>
    {@const passActive = profile.mining.crystalHollows.crystalHollowsLastAccess > Date.now() - 5 * 60 * 60 * 1000}
    <h3 class="font-bold text-text/85">
      Last purchased:
      <span class="text-text">
        {#if passActive}
          {formatDistanceStrict(profile.mining.crystalHollows.crystalHollowsLastAccess, Date.now(), {
            addSuffix: true
          })}
        {:else}
          {formatDate(profile.mining.crystalHollows.crystalHollowsLastAccess, "dd MMMM yyyy 'at' HH:mm")}
          ({formatDistanceStrict(profile.mining.crystalHollows.crystalHollowsLastAccess, Date.now(), {
            addSuffix: true
          })})
        {/if}
      </span>
    </h3>
  </AdditionStat>
  <AdditionStat text="Crystal Nucleus" data={`Completed ${profile.mining.crystalHollows.nucleusRuns} ${profile.mining.crystalHollows.nucleusRuns > 1 ? "times" : "time"}`} asterisk={true}>
    {@const placableCrystals = ["jade", "amber", "amethyst", "sapphire", "topaz"]}
    <h3 class="text-sm font-bold text-text/85">Crystals:</h3>
    <ul class="mt-0.5 space-y-0.5 text-sm font-bold">
      {#each Object.entries(profile.mining.crystalHollows.progress.crystals).filter(([crystalName, _crystalStatus]) => placableCrystals.includes(crystalName)) as [crystalName, crystalStatus]}
        <li class="flex">
          <span class="flex-1 capitalize text-text/85">
            - {crystalName}:
            <span class={cn("capitalize", crystalStatus === "PLACED" ? "text-minecraft-a" : "text-minecraft-c")}>
              {crystalStatus.replace("_", " ").toLowerCase()}
            </span>
          </span>
        </li>
      {/each}
    </ul>

    <h3 class="mt-5 text-sm font-bold text-text/85">Other Crystals:</h3>
    <ul class="mt-0.5 space-y-0.5 text-sm font-bold">
      {#each Object.entries(profile.mining.crystalHollows.progress.crystals).filter(([crystalName, _crystalStatus]) => !placableCrystals.includes(crystalName)) as [crystalName, crystalStatus]}
        <li class="flex">
          <span class="flex-1 capitalize text-text/85">
            - {crystalName}:
            <span class={cn("capitalize", crystalStatus === "PLACED" ? "text-minecraft-a" : "text-minecraft-c")}>
              {crystalStatus.replace("_", " ").toLowerCase()}
            </span>
          </span>
        </li>
      {/each}
    </ul>

    <h3 class="mt-5 text-sm font-bold text-text/85">Precursor parts delivered:</h3>
    <ul class="mt-0.5 space-y-0.5 text-sm font-bold">
      {#each Object.entries(profile.mining.crystalHollows.progress.parts) as [partName, partStatus]}
        {@const delivered = partStatus === "DELIVERED"}
        <li class={cn("capitalize", delivered ? "text-minecraft-a" : "text-minecraft-c")}>
          {delivered ? "✔" : "✖"}
          {#if partName.startsWith("FTX")}
            {partName.replace("_", " ")}
          {:else}
            {partName.replace("_", " ").toLowerCase()}
          {/if}
        </li>
      {/each}
    </ul>
  </AdditionStat>
</div>

<h3 class="text-xl font-semibold">Heart of the Mountain</h3>
<div class="space-y-0.5">
  <AdditionStat text="Tier" data={profile.mining.level.level.toString()} />
  <AdditionStat text="Token Of The Mountain" data={`${profile.mining.tokens.spent}/${profile.mining.tokens.total}`} />
  <AdditionStat text="Peak Of The Mountain" data={`${profile.mining.peak_of_the_mountain.level}/${profile.mining.peak_of_the_mountain.maxLevel}`} />
  <AdditionStat text="Mithril Powder" data={format(profile.mining.powder.mithril.available + profile.mining.powder.mithril.spent)} asterisk={true}>
    <ul>
      {#each Object.entries(profile.mining.powder.mithril) as [type, amount]}
        <li>
          {type}: {amount}
        </li>
      {/each}
    </ul>
  </AdditionStat>
  <AdditionStat text="Gemstone Powder" data="TODO" asterisk={true} />
  <AdditionStat text="Glacite Powder" data="TODO" asterisk={true} />
  <AdditionStat text="Pickaxe Ability" data={profile.mining.selectedPickaxeAbility} />
</div>

<div class="relative mb-0 rounded-lg bg-background/30 p-5 @container">
  <div class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 pt-5 @md:gap-1.5 @xl:gap-2">
    {#each profile.mining.hotm as item, index}
      {#if item.display_name}
        <div class="flex aspect-square items-center justify-center rounded bg-text/[0.04]" in:fade|global={{ duration: 300, delay: 5 * (index + 1) }}>
          <Item piece={item} isInventory={true} />
        </div>
      {:else}
        <div class="aspect-square rounded bg-text/[0.04]" in:fade|global={{ duration: 300, delay: 5 * (index + 1) }}></div>
      {/if}
    {/each}
  </div>
</div>

<h3 class="text-xl font-semibold">Forge</h3>
<div class="space-y-0.5">
  <AdditionStat text="Tier" data={profile.mining.level.level.toString()} />
</div>
