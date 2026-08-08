<script lang="ts">
  import type { ModelsResolvedLoadout } from "$lib/shared/api/orval-generated";
  import { ScrollArea } from "$ui/scroll-area";
  import LoadoutCard from "./LoadoutCard.svelte";

  type Props = {
    loadouts: ModelsResolvedLoadout[];
  };

  let { loadouts }: Props = $props();

  function loadoutKey(loadout: ModelsResolvedLoadout | undefined, index: number): string {
    return `${loadout?.id ?? "loadout"}-${index}`;
  }
</script>

<div>
  <ScrollArea
    class="h-144 max-h-[calc(100dvh-12rem)]"
    type="auto"
    viewportClasses="rounded-xl pr-4 scroll-fade-track-y">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {#each loadouts as loadout, index (loadoutKey(loadout, index))}
        <LoadoutCard {loadout} {index} />
      {/each}
    </div>
    <div
      class="pointer-events-none sticky -bottom-1 z-10 -mt-36 h-36 w-full bg-linear-to-t from-background/80 to-transparent scroll-fade-y blur-xs">
    </div>
  </ScrollArea>
</div>
