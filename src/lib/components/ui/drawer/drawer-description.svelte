<script lang="ts">
  import { cn } from "$utils.js";
  import { Drawer as DrawerPrimitive } from "vaul-svelte";

  let { ref = $bindable(null), class: className, ...restProps }: DrawerPrimitive.DescriptionProps = $props();
</script>

<DrawerPrimitive.Description
  bind:ref
  data-slot="drawer-description"
  class={cn("text-sm text-muted-foreground", className)}
  {...restProps} />
