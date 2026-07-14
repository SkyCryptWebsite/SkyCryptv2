<script lang="ts">
  import { cn } from "$utils.js";
  import { Dialog as DialogPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: DialogPrimitive.OverlayProps = $props();
</script>

<DialogPrimitive.Overlay
  bind:ref
  data-slot="dialog-overlay"
  class={cn(
    "fixed inset-0 isolate z-50 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
    className
  )}
  {...restProps} />
