<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Bonus from "$lib/components/Bonus.svelte";
  import Item from "$lib/components/Item.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { RARITY_COLORS } from "$lib/shared/constants/items";
  import { STATS_DATA } from "$lib/shared/constants/stats";
  import { Collapsible } from "bits-ui";
  import ChevronDown from "lucide-svelte/icons/chevron-down";

  const { profile } = getProfileCtx();
  const accessories = $derived(profile.accessories);
</script>

<Items title="Accessories">
  {#if accessories.magicalPower?.total}
    <div>
      <AdditionStat text="Unique Accessories" data={`${accessories.unique} / ${accessories.total}`} maxed={accessories.unique === accessories.total} />
      <AdditionStat text="Completion" data={`${Math.round((accessories.unique / accessories.total) * 100)}%`} maxed={accessories.unique === accessories.total} />
      <AdditionStat text="Recombobulated" data={`${accessories.recombobulated} / ${accessories.totalRecombobulated}`} maxed={accessories.recombobulated === accessories.totalRecombobulated} />
      <AdditionStat text="Magical Power" data={accessories.magicalPower.total} asterisk={true} maxed={accessories.unique === accessories.total}
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
      {#if accessories.accessories.length > 0}
        <div>
          <SectionSubtitle class="mt-2">Active Accessories</SectionSubtitle>
          <Items>
            {#each accessories.accessories as accessory}
              {#if accessory.isInactive === false}
                <Item piece={accessory} />
              {/if}
            {/each}
          </Items>
          {#if accessories.enrichments != null}
            <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
              <span>Enrichments: </span>
              {#each Object.entries(accessories.enrichments) as [key, value], index}
                {#if key !== "missing"}
                  <span class={STATS_DATA[key].color}>
                    {value}×
                    {STATS_DATA[key].name}
                  </span>
                  {#if Object.entries(accessories.enrichments).length - 1 !== index || (Object.entries(accessories.enrichments).length - 1 === index && accessories.enrichments.missing > 0)}
                    // {" "}
                  {/if}
                {/if}
              {/each}
              {#if accessories.enrichments.missing > 0}
                <span class="text-text">{accessories.enrichments.missing}× Missing Enrichment! </span>
              {/if}
            </p>
          {/if}
          <Bonus stats={accessories.stats} class="my-0" />

          {#if accessories.accessories.length > 0 && accessories.accessories.find((accessory) => accessory.isInactive)}
            <Items subtitle="Inactive Accessories">
              {#each accessories.accessories as accessory}
                {#if accessory.isInactive === true}
                  <Item piece={accessory} />
                {/if}
              {/each}
            </Items>
          {/if}
        </div>
      {:else}
        <p class="space-x-0.5 font-bold leading-6 text-text/60">{profile.username} doesn't have any accessories.</p>
      {/if}
      {#if accessories.missing.length > 0 || accessories.upgrades.length > 0}
        <Collapsible.Root>
          <Collapsible.Trigger class="group mb-4 flex items-center gap-0.5 pt-2">
            <ChevronDown class="size-5 transition-all duration-300 group-data-[state=open]:-rotate-180" />
            <SectionSubtitle class="my-0">Missing Accessories</SectionSubtitle>
          </Collapsible.Trigger>
          <Collapsible.Content>
            {#if accessories.missing.length > 0}
              <Items>
                {#each accessories.missing as accessory}
                  <div class="grayscale-[80%] hover:grayscale-0">
                    <Item piece={accessory} />
                  </div>
                {/each}
              </Items>
            {/if}
            {#if accessories.upgrades.length > 0}
              <Items subtitle="Missing Accessory Upgrades">
                {#each accessories.upgrades as accessory}
                  <div class="grayscale-[80%] hover:grayscale-0">
                    <Item piece={accessory} />
                  </div>
                {/each}
              </Items>
            {/if}
          </Collapsible.Content>
        </Collapsible.Root>
      {/if}
    </div>
  {:else}
    <p class="text-text/60">No data available</p>
  {/if}
</Items>
