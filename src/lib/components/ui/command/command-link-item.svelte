<script lang="ts">
  import { cn } from "$utils.js";
  import { Command as CommandPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: CommandPrimitive.LinkItemProps = $props();
</script>

<CommandPrimitive.LinkItem
  bind:ref
  data-slot="command-item"
  class={cn(
    "group/command-item relative flex cursor-default items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium outline-hidden select-none in-data-[slot=dialog-content]:rounded-3xl data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:*:[svg]:text-foreground",
    "data-disabled:pointer-events-none data-disabled:opacity-50",
    className
  )}
  {...restProps} />
