<script lang="ts">
  import { RARITY_COLORS } from "$constants/items";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Bonus from "$lib/components/Bonus.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { Stats as StatsType } from "$types/stats";
  import { Collapsible } from "bits-ui";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const accessories = profile.accessories;
</script>

<Items title="Accessories">
  {#if accessories.accessories.length > 0}
    <div>
      <AdditionStat text="Unique Accessories" data={`${accessories.unique} / ${accessories.total}`} />
      <AdditionStat text="Completion" data={`${Math.round((accessories.unique / accessories.total) * 100)}%`} />
      <AdditionStat text="Recombobulated" data={`${accessories.recombobulated} / ${accessories.totalRecombobulated}`} />
      <AdditionStat text="Magical Power" data={`${accessories.magicalPower.total}`} asterisk={true}
        ><div class="max-w-xs space-y-2 font-bold">
          <div>
            <h3 class="text-text/85">Accessories Breakdown</h3>
            <p class="font-medium italic text-text/80">From your accessory bag.</p>
          </div>
          <div>
            <ul class="font-bold [&_li]:text-text/85 [&_li_span]:text-text">
              <li>
                <span style="color: var(--§6)">22 MP </span>
                ×
                <span style="color: var(--§d)"> {accessories.magicalPower.rarities.mythic.amount} Accs. </span>
                =
                <span style="color: var(--§6)"> {accessories.magicalPower.rarities.mythic.magicalPower} MP</span>
              </li>
              <li>
                <span style="color: var(--§6)">16 MP </span>
                ×
                <span style="color: var(--§6)"> {accessories.magicalPower.rarities.legendary.amount} Accs. </span>
                =
                <span style="color: var(--§6)"> {accessories.magicalPower.rarities.legendary.magicalPower} MP</span>
              </li>
              <li>
                <span style="color: var(--§6)">12 MP </span>
                ×
                <span style="color: var(--§5)"> {accessories.magicalPower.rarities.epic.amount} Accs. </span>
                =
                <span style="color: var(--§6)"> {accessories.magicalPower.rarities.epic.magicalPower} MP</span>
              </li>
              <li>
                <span style="color: var(--§6)">8 MP </span>
                ×
                <span style="color: var(--§1)"> {accessories.magicalPower.rarities.rare.amount} Accs. </span>
                =
                <span style="color: var(--§6)"> {accessories.magicalPower.rarities.rare.magicalPower} MP</span>
              </li>
              <li>
                <span style="color: var(--§6)">5 MP </span>
                ×
                <span style="color: var(--§a)"> {accessories.magicalPower.rarities.uncommon.amount} Accs. </span>
                =
                <span style="color: var(--§6)"> {accessories.magicalPower.rarities.uncommon.magicalPower} MP</span>
              </li>
              <li>
                <span style="color: var(--§6)">3 MP </span>
                ×
                <span style="color: var(--§f)"> {accessories.magicalPower.rarities.common.amount} Accs. </span>
                =
                <span style="color: var(--§6)"> {accessories.magicalPower.rarities.common.magicalPower} MP</span>
              </li>
              <li>
                <span style="color: var(--§6)">3 MP </span>
                ×
                <span style="color: var(--§c)"> {accessories.magicalPower.rarities.special.amount} Accs. </span>
                =
                <span style="color: var(--§6)"> {accessories.magicalPower.rarities.special.magicalPower} MP</span>
              </li>
              <li>
                <span style="color: var(--§6)">5 MP </span>
                ×
                <span style="color: var(--§c)"> {accessories.magicalPower.rarities.very_special.amount} Accs. </span>
                =
                <span style="color: var(--§6)"> {accessories.magicalPower.rarities.very_special.magicalPower} MP</span>
              </li>
            </ul>
          </div>

          <div>
            <ul class="font-bold [&_li]:text-text/85 [&_li_span]:text-text">
              {#if accessories.magicalPower.abiphone > 0}
                <li>
                  <span style="color: var(--§{RARITY_COLORS['rare']})">Abicase: </span>
                  =
                  <span style="color: var(--§6)"> +{accessories.magicalPower.abiphone} MP</span>
                </li>
              {/if}
              {#if accessories.magicalPower.riftPrism > 0}
                <li>
                  <span style="color: var(--§{RARITY_COLORS['rare']})">Rift Prism: </span>
                  =
                  <span style="color: var(--§6)"> +{accessories.magicalPower.riftPrism} MP</span>
                </li>
              {/if}
              {#if accessories.magicalPower.hegemony.amount > 0 && accessories.magicalPower.hegemony.rarity}
                <li>
                  <span style="color: var(--§{RARITY_COLORS[accessories.magicalPower.hegemony.rarity]}">Hegemony Artifact: </span>
                  =
                  <span style="color: var(--§6)"> +{accessories.magicalPower.hegemony} MP</span>
                </li>
              {/if}
            </ul>
          </div>
          <p class="text-text/85">
            Total:
            <span style="color: var(--§6)" class="text-text">
              {accessories.magicalPower.total} Magical Power
            </span>
          </p>
        </div>
      </AdditionStat>
    </div>
    <div>
      <Items subtitle="Active Accessories">
        {#each accessories.accessories as accessory}
          {#if accessory.isInactive === false}
            <Item piece={accessory} />
          {/if}
        {/each}
      </Items>
      <p class="space-x-0.5 font-bold capitalize leading-6">
        <span class="text-text/60">Enrichments: </span>
        <span class="text-text">{accessories.enrichments.missing}× Missing Enrichment! </span>
      </p>
      <Bonus stats={accessories.stats} />
      <br />
      <Items subtitle="Inactive Accessories">
        {#each accessories.accessories as accessory}
          {#if accessory.isInactive === true}
            <Item piece={accessory} />
          {/if}
        {/each}
      </Items>

      <br />

      {#if accessories.missing.length > 0 || accessories.upgrades.length > 0}
        <Collapsible.Root>
          <Collapsible.Trigger>
            <h4 class="text-xl capitalize text-text">Missing Accessories</h4>
          </Collapsible.Trigger>
          <Collapsible.Content>
            {#if accessories.missing.length > 0}
              <Items subtitle="Missing Accessories">
                {#each accessories.missing as accessory}
                  <Item piece={accessory} />
                {/each}
              </Items>
            {/if}
            {#if accessories.upgrades.length > 0}
              <Items subtitle="Missing Accessory Upgrades">
                {#each accessories.upgrades as accessory}
                  <Item piece={accessory} />
                {/each}
              </Items>
            {/if}
          </Collapsible.Content>
        </Collapsible.Root>
      {/if}
    </div>
  {:else}
    <p class="space-x-0.5 font-bold leading-6 text-text/60">{profile.username} doesn't have any accessories.</p>
  {/if}
</Items>
