<script lang="ts">
  import { Button } from "$ui/button/index.js";
  import { cn, type WithElementRef } from "$utils.js";
  import { Dialog as DialogPrimitive } from "bits-ui";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    showCloseButton = false,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    showCloseButton?: boolean;
  } = $props();
</script>

<div
  bind:this={ref}
  data-slot="dialog-footer"
  class={cn("flex flex-col-reverse gap-2 gap-2 sm:flex-row sm:justify-end", className)}
  {...restProps}>
  {@render children?.()}
  {#if showCloseButton}
    <DialogPrimitive.Close>
      {#snippet child({ props })}
        <Button variant="outline" {...props}>Close</Button>
      {/snippet}
    </DialogPrimitive.Close>
  {/if}
</div>
