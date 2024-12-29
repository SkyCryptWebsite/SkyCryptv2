<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import { calculatePercentage, formatNumber } from "$lib/shared/helper";
  import { format as dateFormat, formatDistanceToNowStrict } from "date-fns";
  import { format as numberFormat } from "numerable";

  const { profile } = getProfileCtx();

  const defaultPatternDecimal: string = "0,0.##";
  const defaultPattern: string = "0,0";
</script>

<div class="additional-stats flex flex-col gap-2 @md:flex-row @md:flex-wrap">
  <AdditionStat text="Joined" data={formatDistanceToNowStrict(profile.stats.joined, { addSuffix: true })} asterisk={true}>
    Joined on {dateFormat(profile.stats.joined, "dd MMMM yyyy 'at' HH:mm")}
  </AdditionStat>
  <AdditionStat text="Purse" data={`${formatNumber(profile.stats.purse)} Coins`} />
  <AdditionStat text="Bank Account" data={`${formatNumber(profile.stats.bank)} Coins`} />
  <AdditionStat text="Average Skill Level" data={profile.skills.averageSkillLevel.toFixed(2)} asterisk={true}>
    <div class="max-w-xs space-y-2">
      <div>
        <h3 class="font-bold text-text/85">
          Total Skill XP:
          <span class="text-text">
            {numberFormat(profile.skills.totalSkillXp, defaultPattern)}
          </span>
        </h3>
        <p class="font-medium text-text/80">Total XP gained in all skills except Social and Runecrafting.</p>
      </div>
      <div>
        <h3 class="font-bold text-text/85">
          Average Level:
          <span class="text-text">
            {profile.skills.averageSkillLevel.toFixed(2)}
          </span>
        </h3>
        <p class="font-medium text-text/80">Average skill level over all skills except Social and Runecrafting, includes progress to next level.</p>
      </div>
      <div>
        <h3 class="font-bold text-text/85">
          Average Level without progress:
          <span class="text-text">
            {numberFormat(profile.skills.averageSkillLevelWithProgress, defaultPatternDecimal)}
          </span>
        </h3>
        <p class="font-medium text-text/80">Average skill level without including partial level progress.</p>
      </div>
    </div>
  </AdditionStat>
  <AdditionStat text="Fairy Souls" data={`${profile.stats.fairySouls.found} / ${profile.stats.fairySouls.total}`} asterisk={true}>
    {calculatePercentage(profile.stats.fairySouls.found, profile.stats.fairySouls.total)}% of fairy souls found.
  </AdditionStat>
  <AdditionStat text="Networth" data={formatNumber(profile.stats.networth.networth)} asterisk={true}>
    <div class="max-w-xs space-y-2 font-bold">
      <div>
        <h3 class="text-text/85">Networth</h3>
        <p class="font-medium italic text-text/80">Networth calculations by SkyHelper.</p>
      </div>
      <div>
        <ul class="font-bold [&_li]:capitalize [&_li]:text-text/85 [&_li_span]:normal-case [&_li_span]:text-text">
          {#each Object.entries(profile.stats.networth.types) as [key, value]}
            <li>
              {key.replace(/_/g, " ")}:
              <span>
                {formatNumber(value.total)}
              </span>
            </li>
          {/each}
        </ul>
      </div>
      <p class="text-text/85">
        Unsoulbound Networth:
        <span class="text-text">
          {formatNumber(profile.stats.networth.unsoulboundNetworth)}
        </span>
        <br />
        Total Networth:
        <span class="text-text">
          {numberFormat(profile.stats.networth.networth, defaultPattern)} ({formatNumber(profile.stats.networth.networth)})
        </span>
      </p>
    </div>
  </AdditionStat>
</div>
