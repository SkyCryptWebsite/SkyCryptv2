<script lang="ts">
  import { Separator } from "$ui/separator/index.js";
  import { cn } from "$utils.js";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    orientation = "vertical",
    ...restProps
  }: ComponentProps<typeof Separator> = $props();
</script>

<Separator
  bind:ref
  data-slot="button-group-separator"
  {orientation}
  class={cn(
    "relative self-stretch bg-input data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto",
    className
  )}
  {...restProps} />
