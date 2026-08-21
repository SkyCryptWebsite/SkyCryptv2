<script lang="ts">
  import { cn } from "$utils.js";
  import { Drawer as DrawerPrimitive } from "vaul-svelte";

  let { ref = $bindable(null), class: className, ...restProps }: DrawerPrimitive.OverlayProps = $props();
</script>

<DrawerPrimitive.Overlay
  bind:ref
  data-slot="drawer-overlay"
  class={cn(
    "fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
    className
  )}
  {...restProps} />
