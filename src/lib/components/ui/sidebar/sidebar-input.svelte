<script lang="ts">
  import { Input } from "$ui/input/index.js";
  import { cn } from "$utils.js";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    value = $bindable(""),
    class: className,
    ...restProps
  }: ComponentProps<typeof Input> = $props();
</script>

<Input
  bind:ref
  bind:value
  data-slot="sidebar-input"
  data-sidebar="input"
  class={cn("h-8 w-full bg-input/50 shadow-none", className)}
  {...restProps} />
