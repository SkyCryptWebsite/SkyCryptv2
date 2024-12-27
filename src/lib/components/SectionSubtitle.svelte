<script lang="ts">
  import { cn } from "$lib/shared/utils";
  import type { Snippet } from "svelte";

  let { children, class: className }: { children?: Snippet; class?: string } = $props();
</script>

<h4 class={cn("my-2 text-xl font-semibold capitalize text-text/90", className)}>
  {@render children?.()}
</h4>
