<script lang="ts">
  import { initInternalState } from "$ctx";
  import { AdditionStat } from "$lib/components/stats";
  import { formatNumber } from "$lib/shared/helper";
  import { formatDistanceToNowStrict } from "date-fns";
  import { getCardDataContext } from "../index";
  import { getDefaultCardDataContext, getDefaultCardSettingsContext } from "./Base.svelte";

  initInternalState();
  const { profile } = getCardDataContext();
  const { networth } = getDefaultCardDataContext();
  const { showJoinedDate, showFairySouls } = getDefaultCardSettingsContext();
</script>

<div class="flex flex-row flex-wrap gap-x-2">
  {#if networth?.normal}
    <AdditionStat text="Networth" data={formatNumber(networth.normal.networth ?? 0)} />
  {/if}
  {#if networth?.nonCosmetic}
    <AdditionStat text="Non-Cosmetic Networth" data={formatNumber(networth.nonCosmetic.networth ?? 0)} />
  {/if}

  {#if profile != null}
    {#if profile.bank != null && profile.personalBank != null}
      <AdditionStat text="Bank Account" data={`${formatNumber(profile.bank + profile.personalBank)} Coins`} />
    {/if}
    {#if profile.purse != null}
      <AdditionStat text="Purse" data={`${formatNumber(profile.purse)} Coins`} />
    {/if}
    {#if profile.skills?.averageSkillLevel}
      <AdditionStat text="Average Skill Level" data={profile.skills.averageSkillLevel.toFixed(2)} />
    {/if}
    {#if profile.joined != null && showJoinedDate}
      <AdditionStat text="Joined" data={formatDistanceToNowStrict(profile.joined, { addSuffix: true })} />
    {/if}
    {#if profile.fairySouls && showFairySouls}
      <AdditionStat
        text="Fairy Souls"
        data={`${profile.fairySouls.found} / ${profile.fairySouls.total}`}
        maxed={(profile.fairySouls.found ?? 0) >= (profile.fairySouls.total ?? 0)} />
    {/if}
  {/if}
</div>
