<script lang="ts">
  import { SectionSubtitle } from "$components/sections";
  import * as Collapsible from "$ui/collapsible";
  import { cn } from "$utils";
  import ChevronsDownUp from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
    class?: string;
  };

  const { children, class: classList }: Props = $props();
</script>

<Collapsible.Trigger class={cn("group hit-area-x-2 hit-area-y-2 flex h-full w-full items-center py-4", classList)}>
  <div class="grid size-5 place-items-center">
    <div
      class="absolute size-5 motion-scale-in-80 motion-blur-in-xs motion-opacity-in transition-all duration-150 ease-out will-change-transform group-data-[state=open]:motion-scale-out-80 group-data-[state=open]:motion-blur-out-xs group-data-[state=open]:motion-opacity-out">
      <ChevronsUpDown class="size-full" />
    </div>
    <div
      class="absolute size-5 motion-scale-in-80 motion-blur-in-xs motion-opacity-in transition-all duration-150 ease-out will-change-transform group-data-[state=closed]:motion-scale-out-80 group-data-[state=closed]:motion-blur-out-xs group-data-[state=closed]:motion-opacity-out">
      <ChevronsDownUp class="size-full" />
    </div>
  </div>

  <SectionSubtitle class="my-0">{@render children?.()}</SectionSubtitle>
</Collapsible.Trigger>
