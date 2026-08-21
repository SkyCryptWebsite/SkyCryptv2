<script lang="ts">
  import { cn } from "$utils.js";
  import { Dialog as SheetPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: SheetPrimitive.OverlayProps = $props();
</script>

<SheetPrimitive.Overlay
  bind:ref
  data-slot="sheet-overlay"
  class={cn("fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm", className)}
  {...restProps} />
