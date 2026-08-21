<script lang="ts">
  import { Separator } from "$ui/separator/index.js";
  import { cn } from "$utils.js";
  import type { Separator as SeparatorPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: SeparatorPrimitive.RootProps = $props();
</script>

<Separator
  bind:ref
  data-slot="select-separator"
  class={cn("pointer-events-none -mx-1.5 my-1.5 h-px bg-border", className)}
  {...restProps} />
