<script lang="ts">
  import { cn } from "$utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let { class: className, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...rest} class={cn("rounded-md border border-border", className)}>
  {@render children?.()}
</div>
