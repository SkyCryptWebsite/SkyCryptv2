<script lang="ts">
  import { cn } from "$utils.js";
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: DropdownMenuPrimitive.SeparatorProps = $props();
</script>

<DropdownMenuPrimitive.Separator
  bind:ref
  data-slot="dropdown-menu-separator"
  class={cn("-mx-1.5 my-1.5 h-px bg-border/50", className)}
  {...restProps} />
