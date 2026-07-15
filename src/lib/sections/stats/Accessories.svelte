<script lang="ts">
  import { getCombinedContext } from "$ctx";
  import { Item } from "$lib/components/item";
  import { Section, SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat, Bonus } from "$lib/components/stats";
  import { Label } from "$lib/components/ui/label";
  import { RARITY_COLORS } from "$lib/shared/constants/rarities";
  import { STATS_DATA } from "$lib/shared/constants/stats";
  import * as helper from "$lib/shared/helper";
  import { calculatePercentage } from "$lib/shared/helper";
  import CollapsibleCustomTrigger from "$src/lib/components/CollapsibleCustomTrigger.svelte";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import * as Collapsible from "$ui/collapsible";
  import { Separator } from "$ui/separator";
  import GemIcon from "@lucide/svelte/icons/gem";

  let { order }: { order: number } = $props();

  const accessories = $derived(getCombinedContext().current?.accessories);

  // MP awarded per accessory of each rarity, in display order. Colors come from RARITY_COLORS.
  const MP_PER_RARITY = [
    { rarity: "mythic", mp: 22 },
    { rarity: "legendary", mp: 16 },
    { rarity: "epic", mp: 12 },
    { rarity: "rare", mp: 8 },
    { rarity: "uncommon", mp: 5 },
    { rarity: "common", mp: 3 },
    { rarity: "special", mp: 3 },
    { rarity: "very_special", mp: 5 }
  ] as const;
</script>

<Section id="Accessories" {order}>
  {#if accessories}
    {#if accessories.magicalPower?.total}
      <div class="contents space-y-4">
        <div class="rounded-xl border p-4">
          {#if accessories.unique != null && accessories.total != null}
            <AdditionStat
              text="Unique Accessories"
              data={`${accessories.unique} / ${accessories.total} (${calculatePercentage(accessories.unique, accessories.total)}%)`}
              maxed={accessories.unique === accessories.total} />
          {/if}
          {#if accessories.recombobulated != null && accessories.totalRecombobulated != null}
            <AdditionStat
              text="Recombobulated"
              data={`${accessories.recombobulated} / ${accessories.totalRecombobulated}`}
              maxed={accessories.recombobulated === accessories.totalRecombobulated} />
          {/if}
          {#if accessories.selectedPower}
            <AdditionStat text="Selected Power" data={helper.titleCase(accessories.selectedPower)} />
          {/if}
          {#if accessories.magicalPower}
            <AdditionStat
              text="Magical Power"
              data={accessories.magicalPower.total ?? 0}
              asterisk={true}
              maxed={accessories.unique === accessories.total}>
              <div class="max-w-xs space-y-2 font-bold">
                <div>
                  <Label class="font-bold">Accessories Breakdown</Label>
                  <p class="text-xs font-medium text-foreground/80 italic">From your accessory bag.</p>
                </div>
                {#if accessories.magicalPower.rarities}
                  {const rarities = accessories.magicalPower.rarities}
                  <div>
                    <ul class="font-bold [&_li]:text-foreground/85 [&_li_span]:text-foreground">
                      {#each MP_PER_RARITY as { rarity, mp } (rarity)}
                        <li>
                          <span class="text-minecraft-6!">{mp} MP </span>
                          ×
                          <span
                            class="text-(--rarityColor)! capitalize"
                            style="--rarityColor: var(--§{RARITY_COLORS[rarity]})">
                            {rarities[rarity]?.amount ?? 0}
                            {rarity.replaceAll("_", " ")}.
                          </span>
                          =
                          <span class="text-minecraft-6!"> {rarities[rarity]?.magicalPower ?? 0} MP</span>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}

                <div>
                  <ul class="font-bold [&>li]:text-foreground/85 [&>li>span]:text-foreground">
                    {#if accessories.magicalPower.abiphone != null && accessories.magicalPower.abiphone > 0}
                      <li>
                        <span class="text-(--rarityColor)!" style="--rarityColor: var(--§{RARITY_COLORS['rare']})"
                          >Abicase:
                        </span>
                        =
                        <span class="text-minecraft-6!"> +{accessories.magicalPower.abiphone} MP</span>
                      </li>
                    {/if}
                    {#if accessories.magicalPower.riftPrism != null && accessories.magicalPower.riftPrism > 0}
                      <li>
                        <span class="text-(--rarityColor)!" style="--rarityColor: var(--§{RARITY_COLORS['rare']})"
                          >Rift Prism:
                        </span>
                        =
                        <span class="text-minecraft-6!"> +{accessories.magicalPower.riftPrism} MP</span>
                      </li>
                    {/if}
                    {#if accessories.magicalPower.hegemony}
                      {#if accessories.magicalPower.hegemony.amount != null && accessories.magicalPower.hegemony.amount > 0 && accessories.magicalPower.hegemony.rarity}
                        <li>
                          <span
                            class="text-(--rarityColor)!"
                            style="--rarityColor: var(--§{RARITY_COLORS[accessories.magicalPower.hegemony.rarity]}"
                            >Hegemony Artifact:
                          </span>
                          =
                          <span class="text-minecraft-6!">
                            +{accessories.magicalPower.hegemony.amount.toString()} MP</span>
                        </li>
                      {/if}
                    {/if}
                  </ul>
                </div>
                <p class="text-foreground/85">
                  Total:
                  <span class="text-minecraft-6!">
                    {accessories.magicalPower.total} Magical Power
                  </span>
                </p>
              </div>
            </AdditionStat>
          {/if}
        </div>

        {#if accessories.accessories && accessories.accessories.length > 0}
          <div class="rounded-xl border p-4">
            <SectionSubtitle>Active Accessories</SectionSubtitle>

            {#if accessories.enrichments != null}
              <p class="space-x-0.5 leading-6 font-bold text-muted-foreground capitalize">
                <span>Enrichments: </span>
                {#each Object.entries(accessories.enrichments) as [key, value], index (index)}
                  {#if key !== "missing" && STATS_DATA[key.toLowerCase()]}
                    <span class={STATS_DATA[key.toLowerCase()].color}>
                      {value}×
                      {STATS_DATA[key.toLowerCase()].name}
                    </span>
                    {#if Object.entries(accessories.enrichments).length - 1 !== index || (Object.entries(accessories.enrichments).length - 1 === index && accessories.enrichments.missing > 0)}
                      //
                    {/if}
                  {/if}
                {/each}
                {#if accessories.enrichments.missing > 0}
                  <span class="text-foreground">{accessories.enrichments.missing}× Missing Enrichment! </span>
                {/if}
              </p>
            {/if}

            {#if accessories.stats}
              <Bonus stats={accessories.stats} />
            {/if}

            <Separator class="my-4" />

            <ScrollAreaItems>
              {#each accessories.accessories as accessory, index (index)}
                {#if accessory.isInactive === false}
                  <Item piece={accessory} />
                {/if}
              {/each}
            </ScrollAreaItems>
          </div>

          {#if accessories.accessories.length > 0 && accessories.accessories.find((accessory) => accessory.isInactive)}
            <div class="rounded-xl border p-4">
              <SectionSubtitle>Inactive Accessories</SectionSubtitle>
              <ScrollAreaItems>
                {#each accessories.accessories as accessory, index (index)}
                  {#if accessory.isInactive === true}
                    <Item piece={accessory} />
                  {/if}
                {/each}
              </ScrollAreaItems>
            </div>
          {/if}
        {:else}
          <EmptyStat title="No Accessories" description="This player doesn't have any accessories" icon={GemIcon} />
        {/if}

        {#if (accessories.missing && accessories.missing.length > 0) || (accessories.upgrades && accessories.upgrades.length > 0)}
          <Collapsible.Root class="rounded-xl border p-2">
            <CollapsibleCustomTrigger>Missing Accessories</CollapsibleCustomTrigger>

            <Collapsible.Content>
              {#if accessories.missing && accessories.missing.length > 0}
                <div class="space-y-4 pl-4">
                  <ScrollAreaItems>
                    {#each accessories.missing as accessory, index (index)}
                      <div class="grayscale-80 hover:grayscale-0">
                        <Item piece={accessory} />
                      </div>
                    {/each}
                  </ScrollAreaItems>
                </div>
              {/if}
              <Separator />
              {#if accessories.upgrades && accessories.upgrades.length > 0}
                <div class="my-4 space-y-4 pl-4">
                  <SectionSubtitle>Missing Accessory Upgrades</SectionSubtitle>
                  <ScrollAreaItems>
                    {#each accessories.upgrades as accessory, index (index)}
                      <div class="grayscale-80 hover:grayscale-0">
                        <Item piece={accessory} />
                      </div>
                    {/each}
                  </ScrollAreaItems>
                </div>
              {/if}
            </Collapsible.Content>
          </Collapsible.Root>
        {/if}
      </div>
    {:else}
      <EmptyStat title="No Accessories" description="This player doesn't have any accessories" icon={GemIcon} />
    {/if}
  {:else}
    <EmptyStat title="No Accessories" description="This player doesn't have any accessories" icon={GemIcon} />
  {/if}
</Section>
