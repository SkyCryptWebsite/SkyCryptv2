<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import Chip from "$lib/components/Chip.svelte";
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import { cn } from "$lib/shared/utils";
  import { format } from "numerable";

  const { misc } = getProfileCtx();
</script>

{#if misc.essence != null}
  <div class="space-y-4">
    <SectionSubtitle class="!uppercase">Essence</SectionSubtitle>
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
{/if}
