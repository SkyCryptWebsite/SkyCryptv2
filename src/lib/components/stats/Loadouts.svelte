<script lang="ts">
  import type { ModelsResolvedLoadout } from "$lib/shared/api/orval-generated";
  import ScrollAreaItems from "$src/lib/components/ScrollAreaItems.svelte";
  import * as Tabs from "$ui/tabs";
  import { cubicOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import LoadoutCard from "./LoadoutCard.svelte";

  type Props = {
    loadouts: ModelsResolvedLoadout[];
  };

  let { loadouts }: Props = $props();
  let tabValue = $derived(loadouts[0]?.id?.toString() ?? `loadout-0`);

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicOut
  });

  function loadoutKey(loadout: ModelsResolvedLoadout | undefined, index: number): string {
    return `${loadout?.id ?? "loadout"}-${index}`;
  }
</script>

<Tabs.Root bind:value={tabValue} class="w-full">
  <ScrollAreaItems orientation="horizontal" viewportClasses="scroll-fade-track-x [&>div>div]:pt-0 [&>div>div]:pb-4">
    <Tabs.List class="gap-2 bg-inherit">
      {#each loadouts as loadout, index (loadoutKey(loadout, index))}
        {const isActive = $derived(tabValue === (loadout.id?.toString() ?? `loadout-${index}`))}

        <Tabs.Trigger
          value={loadout.id?.toString() ?? `loadout-${index}`}
          class="h-9 border border-border! data-active:bg-inherit dark:data-active:bg-inherit">
          <div class="relative z-10">
            {loadout.name}
          </div>
          {#if isActive}
            <div
              class="absolute inset-0 rounded-full bg-primary"
              in:send={{ key: "active-tab" }}
              out:receive={{ key: "active-tab" }}>
            </div>
          {/if}
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
  </ScrollAreaItems>
  {#each loadouts as loadout, index (loadoutKey(loadout, index))}
    <Tabs.Content value={loadout.id?.toString() ?? `loadout-${index}`}>
      <LoadoutCard {loadout} />
    </Tabs.Content>
  {/each}
</Tabs.Root>
