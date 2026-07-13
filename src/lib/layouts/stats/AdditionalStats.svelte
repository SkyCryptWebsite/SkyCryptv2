<script lang="ts">
  import { getHoverContext, getProfileContext } from "$ctx";
  import { AdditionStat, NetworthCard } from "$lib/components/stats";
  import { getProfileNetworth } from "$lib/shared/api/skycrypt-api.remote";
  import { calculatePercentage, formatNumber } from "$lib/shared/helper";
  import { Button } from "$ui/button";
  import { Label } from "$ui/label";
  import * as Popover from "$ui/popover";
  import { Separator } from "$ui/separator";
  import { Spinner } from "$ui/spinner";
  import { tz } from "@date-fns/tz";
  import CircleX from "@lucide/svelte/icons/circle-x";
  import { isHttpError } from "@sveltejs/kit";
  import { format as dateFormat, formatDistanceToNowStrict } from "date-fns";
  import { format as numberFormat } from "numerable";

  const profile = $derived(getProfileContext().current);
  const profileUUID = $derived(profile?.uuid);
  const profileId = $derived(profile?.profile_id);

  const defaultPatternDecimal: string = "0,0.##";
  const defaultPattern: string = "0,0";

  const isHover = getHoverContext();

  let networthOpen = $state<boolean>(false);
</script>

<div class="flex flex-col gap-2 *:motion-preset-focus *:motion-preset-slide-right *:motion-delay-[calc(sibling-index()*0.1s)] @md:flex-row @md:flex-wrap">
  {#key profile}
    {#if profile != null}
      {#if profile.joined != null}
        <AdditionStat text="Joined" data={formatDistanceToNowStrict(profile.joined, { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })} asterisk={true}>
          Joined on {dateFormat(profile.joined, "dd MMMM yyyy 'at' HH:mm", { in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}
        </AdditionStat>
      {/if}
      {#if profile.purse != null}
        <AdditionStat text="Purse" data={`${formatNumber(profile.purse)} Coins`} />
      {/if}
      {#if profile.bank != null && profile.personalBank != null}
        <AdditionStat text="Bank Account" data={`${formatNumber(profile.bank + profile.personalBank)} Coins`} asterisk={profile.bank && profile.personalBank ? true : false}>
          <div class="space-y-2">
            <Label class="gap-1">
              Bank:
              <span class="font-bold">
                {formatNumber(profile.bank)}
              </span>
            </Label>
            {#if profile.personalBank}
              <Label class="gap-1">
                Personal Bank:
                <span class="font-bold">
                  {formatNumber(profile.personalBank)}
                </span>
              </Label>
            {/if}
          </div>
        </AdditionStat>
      {/if}
      {#if profile.skills?.averageSkillLevel}
        <AdditionStat text="Average Skill Level" data={profile.skills.averageSkillLevel.toFixed(2)} asterisk={true}>
          <div class="max-w-xs space-y-2">
            <Label class="gap-1">
              Total Skill XP:
              <span class="font-bold">
                {numberFormat(profile.skills.totalSkillXp, defaultPattern)}
              </span>
            </Label>
            <p class="font-medium text-foreground/60 max-w-xs">Total XP gained in all skills except Social and Runecrafting.</p>
          </div>
          {#if profile.skills.averageSkillLevelWithProgress != null}
            <Separator />

            <Label class="gap-1">
              Average Level:
              <span class="font-bold">
                {profile.skills.averageSkillLevelWithProgress.toFixed(2)}
              </span>
            </Label>
            <p class="font-medium text-foreground/60 max-w-xs">Average skill level over all skills except Social and Runecrafting, includes progress to next level.</p>
          {/if}
          <Separator />

          <Label class="gap-1">
            Average Level without progress:
            <span class="font-bold">
              {numberFormat(profile.skills.averageSkillLevel, defaultPatternDecimal)}
            </span>
          </Label>
          <p class="font-medium text-foreground/60 max-w-xs">Average skill level without including partial level progress.</p>
        </AdditionStat>
      {/if}
      {#if profile.fairySouls}
        <AdditionStat text="Fairy Souls" data={`${profile.fairySouls.found} / ${profile.fairySouls.total}`} maxed={(profile.fairySouls.found ?? 0) >= (profile.fairySouls.total ?? 0)} asterisk={true}>
          {calculatePercentage(profile.fairySouls.found ?? 0, profile.fairySouls.total ?? 0)}% of fairy souls found.
        </AdditionStat>
      {/if}
    {/if}
    <svelte:boundary>
      {const networth = $derived(profileUUID != null && profileId != null ? await getProfileNetworth({ uuid: profileUUID, profileId }) : null)}
      {#snippet pending()}
        <div class="my-0 flex items-center gap-1 font-bold text-foreground/60">
          Networth:
          <Spinner />
        </div>
      {/snippet}

      {#snippet failed(err, retry)}
        <div class="my-0 flex items-center gap-0.5 font-bold text-foreground/60">
          <Popover.Root bind:open={networthOpen}>
            <Popover.Trigger
              onpointerenter={() => {
                if (!isHover.current) return;
                networthOpen = true;
              }}>
              Networth:
            </Popover.Trigger>
            {#if isHttpError(err)}
              <Popover.Content class="bg-transparent glass glass-bg-popover" sideOffset={8} side="bottom" align="start" collisionPadding={6} strategy="absolute">
                {err.body.message}
              </Popover.Content>
            {/if}
          </Popover.Root>
          <Button variant="link" onclick={retry} class="px-0 font-bold text-base text-foreground hover:text-foreground/80">Retry</Button>
          <CircleX class="size-3 -translate-y-1 text-destructive" />
        </div>
      {/snippet}
      {#if networth}
        {#if networth.normal}
          <NetworthCard networth={networth.normal} title="Networth" />
        {/if}
        {#if networth.nonCosmetic}
          <NetworthCard networth={networth.nonCosmetic} title="Non-Cosmetic Networth" />
        {/if}
      {/if}
    </svelte:boundary>
  {/key}
</div>
