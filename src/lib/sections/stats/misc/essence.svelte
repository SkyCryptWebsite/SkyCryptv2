<script lang="ts">
  import Chip from "$lib/components/Chip.svelte";
  import { cn } from "$lib/utils";
  import type { Stats as StatsType } from "$types/stats";
  import { format } from "numerable";
  import { getContext } from "svelte";

  const misc = getContext<StatsType["misc"]>("misc");
</script>

<div class="space-y-4">
  <h3 class="text-xl font-semibold">Essence</h3>
  <div class="flex flex-wrap gap-4">
    {#each misc.essence as essence}
      {@const hasUnlocked = essence.amount}
      <Chip image={{ src: essence.texture }} class={cn("h-fit w-fit", { "opacity-50": !hasUnlocked })}>
        <div class={cn("flex flex-col")}>
          <div class="font-bold">
            <span class="opacity-60">{essence.name}</span>
            <div class="text-sm">
              <span class="opacity-60">Amount:</span>
              <span class="text-text">{format(essence.amount)}</span>
            </div>
          </div>
        </div>
      </Chip>
    {/each}
  </div>
</div>
