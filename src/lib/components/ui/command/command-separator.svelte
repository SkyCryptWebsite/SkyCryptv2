<script lang="ts">
  import { cn } from "$utils.js";
  import { Command as CommandPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: CommandPrimitive.SeparatorProps = $props();
</script>

<CommandPrimitive.Separator
  bind:ref
  data-slot="command-separator"
  class={cn("my-1.5 h-px bg-border/50", className)}
  {...restProps} />
