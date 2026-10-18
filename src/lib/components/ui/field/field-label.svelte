<script lang="ts">
  import { Label } from "$ui/label/index.js";
  import { cn } from "$utils.js";
  import type { ComponentProps } from "svelte";

  let { ref = $bindable(null), class: className, children, ...restProps }: ComponentProps<typeof Label> = $props();
</script>

<Label
  bind:ref
  data-slot="field-label"
  class={cn(
    "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:bg-input/30 has-[>[data-slot=field]]:rounded-2xl has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-input/40 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-4",
    "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
    className
  )}
  {...restProps}>
  {@render children?.()}
</Label>
