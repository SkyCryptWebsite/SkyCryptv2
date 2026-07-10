<script lang="ts">
  import { getCombinedContext } from "$ctx";
  import EmptyStat from "$lib/components/EmptyStat.svelte";
  import { Item } from "$lib/components/item";
  import { Chip } from "$lib/components/misc";
  import { Section, SectionSubtitle } from "$lib/components/sections";
  import { AdditionStat, Bonus } from "$lib/components/stats";
  import { cn } from "$lib/shared/utils";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import { Label } from "$ui/label";
  import { Separator } from "$ui/separator";
  import { tz } from "@date-fns/tz";
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import ShirtIcon from "@lucide/svelte/icons/shirt";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import { formatDate, formatDistanceToNowStrict } from "date-fns";
  import { format } from "numerable";

  let { order }: { order: number } = $props();

  const rift = $derived(getCombinedContext().current?.rift);

  const equipment = $derived(rift?.equipment);
  const armor = $derived(rift?.armor);
</script>

<Section id="Rift" {order}>
  {#if rift}
    <div class="contents space-y-4">
      <div class="border p-4 rounded-xl">
        <AdditionStat text="Visits" data={format(rift.visits)} />
        {#if rift.motes}
          <AdditionStat text="Motes" data={format(rift.motes.purse)} asterisk={true}>
            <div class="max-w-xs space-y-2">
              <div class="rounded-lg space-y-1">
                <Label class="gap-1">
                  Lifetime Motes:
                  <span class="font-bold">
                    {format(rift.motes.lifetime)}
                  </span>
                </Label>
                <p class="font-medium italic text-xs text-foreground/60">Total Motes earned in Rift.</p>
              </div>
              <Separator />
              <div class="space-y-1">
                <Label class="gap-1">
                  Motes Orbs:
                  <span class="font-bold">
                    {rift.motes.orbs}
                  </span>
                </Label>
                <p class="font-medium italic text-xs text-foreground/60">Amount of Mote Orbs player has picked up inside of the Rift.</p>
              </div>
            </div>
          </AdditionStat>
        {/if}
        {#if rift.enigma}
          <AdditionStat text="Enigma Souls" data="{rift.enigma.souls} / {rift.enigma.totalSouls}" maxed={rift.enigma.souls === rift.enigma.totalSouls} asterisk={true}>
            <div class="max-w-xs space-y-1">
              <Label class="gap-1">
                Progress:
                <span class="font-bold">
                  {(((rift.enigma.souls ?? 0) / (rift.enigma.totalSouls ?? 0)) * 100).toFixed(2)}%
                </span>
              </Label>
              <p class="font-medium text-xs italic text-foreground/60">Percentage of Enigma Souls found.</p>
            </div>
          </AdditionStat>
        {/if}
        {#if rift.castle}
          <AdditionStat text="McGrubber's Burgers" data="{rift.castle.grubberStacks} / {rift.castle.maxBurgers}" maxed={rift.castle.grubberStacks === rift.castle.maxBurgers} />
        {/if}
      </div>
      <div class="border p-4 rounded-xl">
        <SectionSubtitle>Armor</SectionSubtitle>

        {#if armor}
          {#if armor.stats}
            <Bonus stats={armor.stats} />
          {/if}
          {#if armor && armor.armor && armor.armor.length > 0}
            <ScrollAreaItems>
              {#each armor.armor.filter((piece) => piece.texture_path) as piece, index (index)}
                <Item {piece} />
              {/each}
            </ScrollAreaItems>
          {:else}
            <EmptyStat title="No Armor" description="This player has no Rift armor equipped" icon={ShirtIcon} class="mt-2" />
          {/if}
        {/if}
      </div>

      <div class="border p-4 rounded-xl">
        <SectionSubtitle>Equipment</SectionSubtitle>

        {#if equipment}
          {#if equipment.stats}
            <Bonus stats={equipment.stats} />
          {/if}
          {#if equipment.equipment && equipment.equipment.length > 0}
            <ScrollAreaItems>
              {#each equipment.equipment.filter((piece) => piece.texture_path) as piece, index (index)}
                <Item {piece} />
              {/each}
            </ScrollAreaItems>
          {:else}
            <EmptyStat title="No Equipment" description="This player has no Rift equipment equipped" icon={ShieldIcon} class="mt-2" />
          {/if}
        {/if}
      </div>

      <div class="border p-4 rounded-xl">
        <SectionSubtitle>Porthals</SectionSubtitle>
        {#if rift.porhtal}
          <AdditionStat text="Porthals Unlocked" data={rift.porhtal.porhtalsFound ?? 0} maxed={rift.porhtal.porhtalsFound === 7} />
        {/if}

        {#if rift.porhtal}
          <ScrollAreaItems>
            {#each rift.porhtal.porhtals as porhtal, index (index)}
              {const hasUnlocked = porhtal.unlocked}
              <Chip image={{ src: porhtal.texture ?? "" }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}>
                <div class="flex flex-col">
                  <div class="font-bold whitespace-nowrap">
                    <span class="opacity-60">{porhtal.name}</span>
                  </div>
                </div>
              </Chip>
            {/each}
          </ScrollAreaItems>
        {/if}
      </div>

      <div class="border p-4 rounded-xl">
        <SectionSubtitle>Timecharms</SectionSubtitle>
        {#if rift.timecharms}
          <AdditionStat text="Timecharms Obtained" data={rift.timecharms.timecharmsFound ?? 0} maxed={rift.timecharms.timecharmsFound === 8} />
        {/if}
        {#if rift.timecharms}
          <ScrollAreaItems>
            {#each rift.timecharms.timecharms as timecharm, index (index)}
              {const hasUnlocked = timecharm.unlocked}

              <Chip image={{ src: timecharm.texture ?? "" }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked }, "whitespace-nowrap")} tooltip={hasUnlocked ? tooltip : undefined}>
                <div class="flex flex-col">
                  <div class="font-bold whitespace-nowrap">
                    <span class="opacity-60">{timecharm.name}</span>
                    <div class="text-sm">
                      {#if hasUnlocked && timecharm.unlockedAt != null}
                        <span class="opacity-60">
                          Obtained {formatDistanceToNowStrict(timecharm.unlockedAt, {
                            addSuffix: true,
                            in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                          })}
                        </span>
                      {:else}
                        <span class="opacity-60">Not Obtained</span>
                      {/if}
                    </div>
                  </div>
                </div>
              </Chip>

              {#snippet tooltip()}
                <div class="text-sm font-bold">
                  <div>
                    <span class="opacity-85">Obtained:</span>
                    <span class="text-foreground">
                      {#if hasUnlocked && timecharm.unlockedAt != null}
                        {formatDate(timecharm.unlockedAt, "dd MMMM yyyy 'at' HH:mm", { in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}
                      {/if}
                    </span>
                  </div>
                </div>
              {/snippet}
            {/each}
          </ScrollAreaItems>
        {/if}
      </div>
    </div>
  {:else}
    <EmptyStat title="No Data" description="This player doesn't have anything related to the Rift" icon={SparklesIcon} />
  {/if}
</Section>
