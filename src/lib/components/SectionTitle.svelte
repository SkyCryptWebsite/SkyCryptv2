<script lang="ts">
  import { cn } from "$lib/shared/utils";
  import type { Snippet } from "svelte";

  let { children, class: className }: { children?: Snippet; class?: string } = $props();
</script>

<h3 class={cn("text-2xl font-semibold capitalize underline decoration-icon decoration-4 [text-underline-position:under]", className)}>
  {@render children?.()}
</h3>
