<script lang="ts">
  import { getSkillsContext } from "$ctx";
  import { Item } from "$lib/components/item";
  import { Chip, ScrollItems } from "$lib/components/misc";
  import { SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat, SkillGear } from "$lib/components/stats";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { cn } from "$lib/shared/utils";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import { Label } from "$ui/label";
  import { Separator } from "$ui/separator";
  import { tz } from "@date-fns/tz";
  import AnvilIcon from "@lucide/svelte/icons/anvil";
  import CheckIcon from "@lucide/svelte/icons/check";
  import PickaxeIcon from "@lucide/svelte/icons/pickaxe";
  import XIcon from "@lucide/svelte/icons/x";
  import { formatDate, formatDistanceToNowStrict } from "date-fns";
  import { format } from "numerable";
  import { cubicOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  const data = $derived(getSkillsContext().skills);
  const mining = $derived(data?.mining);
</script>

<div class="contents space-y-4">
  {#if mining}
    <div class="space-y-4 rounded-xl border p-4">
      <SectionSubtitle>Mining Gear</SectionSubtitle>
      <SkillGear gear={mining.gear} skill="mining" />
    </div>

    <div class="rounded-xl border p-4">
      <SectionSubtitle>Dwarven Mines & Crystal Hollows</SectionSubtitle>
      <div class="space-y-0.5">
        {#if mining.commissions}
          {#if mining.commissions.milestone}
            <AdditionStat
              text="Commissions Milestone"
              data={mining.commissions.milestone.toString()}
              maxed={mining.commissions.milestone === 6} />
          {/if}
          {#if mining.commissions.completions}
            <AdditionStat text="Commissions" data={mining.commissions.completions.toString()} asterisk={true}
              >Commissions from achievements across profiles</AdditionStat>
          {/if}
        {/if}
        {#if mining.crystalHollows}
          {#if mining.crystalHollows.crystalHollowsLastAccess}
            <AdditionStat
              text="Crystal Hollows Pass"
              data={mining.crystalHollows.crystalHollowsLastAccess > Date.now() - 5 * 60 * 60 * 1000
                ? "Purchased"
                : "Expired"}
              asterisk={true}>
              {const passActive = mining.crystalHollows.crystalHollowsLastAccess > Date.now() - 5 * 60 * 60 * 1000}
              <Label>
                Last purchased:
                {#if passActive}
                  {formatDistanceToNowStrict(mining.crystalHollows.crystalHollowsLastAccess, {
                    addSuffix: true,
                    in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                  })}
                {:else}
                  {formatDate(mining.crystalHollows.crystalHollowsLastAccess, "dd MMMM yyyy 'at' HH:mm", {
                    in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                  })}
                  ({formatDistanceToNowStrict(mining.crystalHollows.crystalHollowsLastAccess, {
                    addSuffix: true,
                    in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                  })})
                {/if}
              </Label>
            </AdditionStat>
          {/if}

          <AdditionStat
            text="Crystal Nucleus"
            data={`Completed ${mining.crystalHollows.nucleusRuns} ${mining.crystalHollows.nucleusRuns !== 1 ? "times" : "time"}`}
            asterisk={true}>
            {const placableCrystals = ["jade", "amber", "amethyst", "sapphire", "topaz"]}

            {#if mining.crystalHollows.progress}
              {#if mining.crystalHollows.progress.crystals}
                <Label class="font-bold">Crystals:</Label>
                <ul class="list-inside list-disc">
                  {#each Object.entries(mining.crystalHollows.progress.crystals).filter( ([crystalName, _crystalStatus]) => placableCrystals.includes(crystalName) ) as [crystalName, crystalStatus], index (index)}
                    <li class="relative capitalize">
                      <span class="absolute inset-0 left-3 capitalize">
                        {crystalName}:
                        <span
                          class={cn(
                            "font-bold capitalize",
                            crystalStatus === "PLACED"
                              ? "text-minecraft-e"
                              : crystalStatus === "FOUND"
                                ? "text-minecraft-a"
                                : "text-minecraft-c"
                          )}>
                          {crystalStatus.replace("_", " ").toLowerCase()}
                        </span>
                      </span>
                    </li>
                  {/each}
                </ul>
                <Separator />

                <Label class="font-bold">Other Crystals:</Label>
                <ul class="list-inside list-disc">
                  {#each Object.entries(mining.crystalHollows.progress.crystals).filter(([crystalName, _crystalStatus]) => !placableCrystals.includes(crystalName)) as [crystalName, crystalStatus], index (index)}
                    <li class="relative capitalize">
                      <span class="absolute inset-0 left-3 capitalize">
                        {crystalName}:
                        <span
                          class={cn(
                            "font-bold capitalize",
                            crystalStatus === "FOUND" ? "text-minecraft-a" : "text-minecraft-c"
                          )}>
                          {crystalStatus.replace("_", " ").toLowerCase()}
                        </span>
                      </span>
                    </li>
                  {/each}
                </ul>
              {/if}
              {#if mining.crystalHollows.progress.crystals && mining.crystalHollows.progress.parts}
                <Separator />
              {/if}

              {#if mining.crystalHollows.progress.parts}
                <Label class="font-bold">Precursor parts delivered:</Label>
                <ul>
                  {#each Object.entries(mining.crystalHollows.progress.parts) as [partName, partStatus], index (index)}
                    {const delivered = partStatus === "DELIVERED"}

                    <li
                      class={cn(
                        "-ml-0.5 flex flex-nowrap items-center-safe gap-1 capitalize",
                        delivered ? "text-minecraft-a" : "text-minecraft-c"
                      )}>
                      {#if delivered}
                        <CheckIcon class="size-3 text-foreground" />
                      {:else}
                        <XIcon class="size-3 text-foreground" />
                      {/if}
                      {#if partName.startsWith("FTX")}
                        {partName.replace("_", " ")}
                      {:else}
                        {partName.replace("_", " ").toLowerCase()}
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            {/if}
          </AdditionStat>
        {/if}
      </div>
    </div>

    <div class="rounded-xl border p-4">
      <SectionSubtitle>Heart of the Mountain</SectionSubtitle>
      <div class="space-y-0.5">
        {#if mining.level?.level != null}
          <AdditionStat
            text="Tier"
            data={mining.level.level.toString()}
            maxed={mining.level.level === mining.level.maxLevel} />
        {/if}
        {#if mining.tokens}
          <AdditionStat
            text="Tokens Of The Mountain"
            data={`${mining.tokens.spent}/${mining.tokens.total}`}
            maxed={mining.tokens.spent === mining.tokens.total} />
        {/if}
        {#if mining.peakOfTheMountain}
          <AdditionStat
            text="Peak Of The Mountain"
            data={`${mining.peakOfTheMountain.level}/${mining.peakOfTheMountain.max_level}`}
            maxed={mining.peakOfTheMountain.level === mining.peakOfTheMountain.max_level} />
        {/if}
        {#if mining.powder}
          {#each Object.keys(mining.powder) as key, index (index)}
            {const value = mining.powder[key as keyof typeof mining.powder]}
            {#if value}
              <AdditionStat
                text={`${key} Powder`}
                data={format((value.available ?? 0) + (value.spent ?? 0))}
                asterisk={true}>
                <ul>
                  {#each Object.entries(value) as [type, amount], index (index)}
                    {#if amount != null}
                      <li class="capitalize">
                        {type}:
                        <span class="font-bold">
                          {format(amount ?? 0)}
                        </span>
                      </li>
                    {/if}
                  {/each}
                </ul>
              </AdditionStat>
            {/if}
          {/each}
        {/if}
        {#if mining.selectedPickaxeAbility}
          <AdditionStat text="Pickaxe Ability" data={mining.selectedPickaxeAbility} />
        {/if}
      </div>
    </div>

    {#if mining.hotm && mining.hotm.length > 0}
      <ScrollAreaItems border={true} class="w-full">
        <div class="@container-normal relative mx-auto">
          <div
            class="grid grid-cols-[repeat(9,minmax(1.875rem,4.875rem))] place-content-center gap-1 @md:gap-1.5 @xl:gap-2">
            {#each mining.hotm as item, index (index)}
              {#if item.display_name}
                <div
                  class="flex aspect-square items-center justify-center rounded-xl border bg-foreground/5"
                  in:fade|global={{ duration: 300, delay: 5 * (index + 1), easing: cubicOut }}>
                  <Item piece={item} isInventory={true} />
                </div>
              {:else}
                <div
                  class="aspect-square rounded-xl border bg-foreground/5"
                  in:fade|global={{ duration: 300, delay: 5 * (index + 1), easing: cubicOut }}>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </ScrollAreaItems>
    {/if}

    {#if mining.glaciteTunnels}
      <div class="rounded-xl border p-4">
        <SectionSubtitle>Glacite Tunnels</SectionSubtitle>
        <div class="space-y-2">
          {#if mining.glaciteTunnels.mineshaftsEntered != null}
            <AdditionStat text="Mineshafts Entered" data={mining.glaciteTunnels.mineshaftsEntered.toString()} />
          {/if}
          <Separator />
          <Items class="flex-col" subtitle="Fossils">
            {#if mining.glaciteTunnels.fossils}
              <AdditionStat
                text="Fossils Found"
                data={mining.glaciteTunnels.fossils.found ?? 0}
                maxed={mining.glaciteTunnels.fossils.found === mining.glaciteTunnels.fossils.max} />
            {/if}
            {#if mining.glaciteTunnels.fossils}
              <ScrollItems>
                {#each mining.glaciteTunnels.fossils.fossils as fossil, index (index)}
                  {const hasFound = fossil.found}
                  <Chip
                    image={{ src: fossil.texture_path ?? "" }}
                    class={cn("h-fit w-fit", { "opacity-50": !hasFound })}>
                    <div class="flex flex-col">
                      <div class="font-bold whitespace-nowrap">
                        {fossil.name}
                      </div>
                    </div>
                    {#snippet tooltip()}
                      <div class="text-sm">
                        <span class="text-foreground">{fossil.found ? "Found" : "Not Found"}</span>
                      </div>
                    {/snippet}
                  </Chip>
                {/each}
              </ScrollItems>
            {/if}
          </Items>
          <Separator />
          <Items class="flex-col" subtitle="Corpses">
            {#if mining.glaciteTunnels.corpses}
              <AdditionStat
                text="Corpses Found"
                data={mining.glaciteTunnels.corpses.found ?? ""}
                maxed={mining.glaciteTunnels.corpses.found === mining.glaciteTunnels.corpses.max} />

              <ScrollItems>
                {#each mining.glaciteTunnels.corpses.corpses as corpse, index (index)}
                  {const hasUnlocked = corpse.amount}
                  <Chip
                    image={{ src: corpse.texture_path ?? "" }}
                    class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}>
                    <div class="flex flex-col">
                      <div class="font-bold whitespace-nowrap">
                        <span class="opacity-60">{corpse.name}</span>
                        <div class="text-sm">
                          <span class="opacity-60">Amount:</span>
                          <span class="text-foreground">{format(corpse.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </Chip>
                {/each}
              </ScrollItems>
            {/if}
          </Items>
        </div>
      </div>
    {/if}

    {#if mining.forge}
      <div class="rounded-xl border p-4">
        <SectionSubtitle>Forge</SectionSubtitle>
        <div class="mt-2 space-y-2">
          {#if mining.forge.length === 0}
            <EmptyStat title="Forge" description="No items currently forging" icon={AnvilIcon} />
          {/if}
          {#each mining.forge as item, index (index)}
            {#if item.endingTime != null}
              {const ended = item.endingTime < Date.now()}
              <AdditionStat
                text="Slot {item.slot}"
                data="{item.name} - {ended
                  ? 'ended'
                  : `ends ${formatDistanceToNowStrict(item.endingTime, { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}`}"
                asterisk={true}>
                {formatDate(item.endingTime, "dd MMMM yyyy 'at' HH:mm")}
              </AdditionStat>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  {:else}
    <EmptyStat title="No Data" description="This player doesn't have anything related to mining" icon={PickaxeIcon} />
  {/if}
</div>
