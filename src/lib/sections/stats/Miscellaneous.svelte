<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { formatNumber } from "$lib/tools";
  import type { Stats as StatsType } from "$types/stats";
  import { Collapsible } from "bits-ui";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const misc = profile.misc;
</script>

<Items title="Miscellaneous">
  <Items subtitle="Essence">
    {#each misc.essence as essence}
      <Chip name={essence.name} texture={essence.texture} extra={[["Amount", format(essence.amount)]]} noHover={true} />
    {/each}
    <!-- TODO essence shop -->
    <!-- <Collapsible.Root>
      <Collapsible.Trigger><p>Essence Shop</p></Collapsible.Trigger>
      <Collapsible.Content>
        TODO Essence Shop is not in api yet i dont think.
      </Collapsible.Content>
    </Collapsible.Root> -->
  </Items>
  <div>
    <!-- TODO kills can't be done till my next pr where i make the component for it -->
    <!-- TODO races same reason as above ^ -->
    <Items subtitle="Gifts">
      <div slot="text">
        <AdditionStat text="Gifts Given" data={`${format(misc.gifts.given)}`} />
        <AdditionStat text="Gifts Received" data={`${format(misc.gifts.received)}`} />
      </div>
    </Items>
    <Items subtitle="Season of Jerry">
      <div slot="text">
        <AdditionStat text="Most Winter Snowballs Hit" data={`${misc.season_of_jerry.most_snowballs_hit}`} />
        <AdditionStat text="Most Winter Damage Dealt" data={`${misc.season_of_jerry.most_damage_dealt}`} />
        <AdditionStat text="Most Winter Magma Damage Dealt" data={`${misc.season_of_jerry.most_magma_damage_dealt}`} />
        <AdditionStat text="Most Winter Cannonballs Hit" data={`${misc.season_of_jerry.most_cannonballs_hit}`} />
      </div>
    </Items>
    <Items subtitle="Dragons">
      <div slot="text">
        <AdditionStat text="Most Damage" data={`${format(misc.dragons.most_damage.best.toFixed(2))}`} asterisk={true}>
          <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
            {#each Object.entries(misc.dragons.most_damage) as [dragon, dmg]}
              {#if dragon !== "best"}
                <p class="capitalize">{dragon}: {format(dmg.toFixed(2))}</p>
              {/if}
            {/each}
          </div>
        </AdditionStat>
        <!-- TODO format time -->
        <AdditionStat text="Fastest Kill" data={`${misc.dragons.fastest_kill.best}`} asterisk={true}>
          <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
            {#each Object.entries(misc.dragons.fastest_kill) as [dragon, time]}
              {#if dragon !== "best"}
                <p class="capitalize">{dragon}: {time}</p>
              {/if}
            {/each}
          </div>
        </AdditionStat>
        <AdditionStat text="Last Hits" data={``} />
        <AdditionStat text="Deaths" data={`${misc.dragons.deaths.total}`} asterisk={true}>
          <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
            {#each Object.entries(misc.dragons.fastest_kill) as [dragon, death]}
              {#if dragon !== "total"}
                <p class="capitalize">{dragon}: {format(death)}</p>
              {/if}
            {/each}
          </div>
        </AdditionStat>
      </div>
    </Items>
    <Items subtitle="Endstone Protector">
      <div slot="text">
        <AdditionStat text="Kills" data={format(misc.endstone_protector.kills)} />
        <AdditionStat text="Deaths" data={format(misc.endstone_protector.deaths)} />
      </div>
    </Items>
    <Items subtitle="Damage">
      <div slot="text">
        <AdditionStat text="Highest Critical Damage" data={format(misc.damage.highest_critical_damage.toFixed(2))} />
      </div>
    </Items>
    <Items subtitle="Pet Milestones">
      <!-- TODO add color -->
      <div slot="text">
        <AdditionStat text="Sea Creatures Killed" data={format(misc.pet_milestones.sea_creatures_killed.amount)} asterisk={true}>
          <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
            <p class="capitalize">Pet: {misc.pet_milestones.sea_creatures_killed.rarity}</p>
            <p class="capitalize">Progress: {misc.pet_milestones.sea_creatures_killed.progress === "100.00" ? "maxed!" : misc.pet_milestones.sea_creatures_killed.progress}</p>
          </div>
        </AdditionStat>
        <AdditionStat text="Ores Mined" data={format(misc.pet_milestones.ores_mined.amount)} asterisk={true}>
          <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
            <p class="capitalize">Pet: {misc.pet_milestones.ores_mined.rarity}</p>
            <p class="capitalize">Progress: {misc.pet_milestones.ores_mined.progress === "100.00" ? "maxed!" : misc.pet_milestones.ores_mined.progress}</p>
          </div>
        </AdditionStat>
      </div>
    </Items>
    <!-- TODO Mythological Event  -->
    <Items subtitle="Potions">
      <div slot="text">
        {#if misc.effects.active.length > 0}
          <!-- TODO fix this shit -->
          <AdditionStat text="Active Potion Effects" data={`${misc.effects.active.length}`} asterisk={true}>
            <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
              <p>Active Potion Effects:</p>
              {#each misc.effects.active as effect}
                <p class="capitalize">{effect.effect}</p>
              {/each}
            </div>
          </AdditionStat>
        {/if}
        {#if misc.effects.disabled.length > 0}
          <AdditionStat text="Disabled Potion Effects" data={`${misc.effects.disabled.length}`} asterisk={true}>
            <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
              <p>Disabled Potion Effects:</p>
              {#each misc.effects.disabled as effect}
                <p class="capitalize">{effect}</p>
              {/each}
            </div>
          </AdditionStat>
        {/if}
        {#if misc.effects.paused.length > 0}
          <AdditionStat text="Disabled Potion Effects" data={`${misc.effects.paused.length}`} asterisk={true}>
            <div class="flex flex-col gap-2 text-lg font-bold text-text/60">
              <p>Paused Potion Effects:</p>
              {#each misc.effects.paused as effect}
                <p class="capitalize">{effect}</p>
              {/each}
            </div>
          </AdditionStat>
        {/if}
      </div>
    </Items>
    <Items subtitle="Profile Upgrades">
      <div slot="text">
        <AdditionStat text="Island Size" data={`${misc.profile_upgrades.island_size}`} />
        <AdditionStat text="Minion Slots" data={`${misc.profile_upgrades.minion_slots}`} />
        <AdditionStat text="Guests Count" data={`${misc.profile_upgrades.guests_count}`} />
        <AdditionStat text="Coop Slot" data={`${misc.profile_upgrades.coop_slots}`} />
        <AdditionStat text="Coins Allowance" data={`${misc.profile_upgrades.coins_allowance}`} />
      </div>
    </Items>
    <Items subtitle="Auctions Sold">
      <div slot="text">
        <AdditionStat text="Fees" data={format(misc.auctions.fees)} />
        <AdditionStat text="Coins Earned" data={format(misc.auctions.gold_earned)} />
        <AdditionStat text="Items Sold" data={format(misc.auctions.total_sold.total)} />
      </div>
    </Items>
    <Items subtitle="Auctions Bought">
      <div slot="text">
        <AdditionStat text="Bids" data={format(misc.auctions.bids)} />
        <AdditionStat text="Highest Bid" data={format(misc.auctions.highest_bid)} />
        <AdditionStat text="Won" data={format(misc.auctions.won)} />
        <AdditionStat text="Coins Spent" data={format(misc.auctions.gold_spent)} />
        <AdditionStat text="Items Bought" data={format(misc.auctions.total_bought.total)} />
      </div>
    </Items>
    <Items subtitle="Uncategorized">
      <div slot="text">
        <AdditionStat text="Soulflow" data={formatNumber(misc.uncategorized.soulflow.toString())} />
        <AdditionStat text="Teleporter Pill Consumed" data={misc.uncategorized.teleporter_pill_consumed === true ? "Yes" : "No"} />
        <AdditionStat text="Reaper Peppers Eaten" data={`${misc.uncategorized.reaper_peppers_eaten}`} />
        <AdditionStat text="Bank Cooldown" data={`${misc.uncategorized.personal_bank}`} />
      </div>
    </Items>
  </div>
  <!-- TODO claimed items -->
</Items>
