<script lang="ts">
  import { cn, type WithElementRef } from "$utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<kbd
  bind:this={ref}
  data-slot="kbd"
  class={cn(
    "pointer-events-none inline-flex h-5.5 w-fit min-w-5.5 items-center justify-center gap-1 rounded-lg bg-muted px-1.5 font-sans text-xs font-medium text-muted-foreground select-none in-data-[slot=input-group]:bg-input in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
    className
  )}
  {...restProps}>
  {@render children?.()}
</kbd>
