<script lang="ts">
  import { cn } from "$lib/shared/utils";
  import type { Snippet } from "svelte";

  let { children, class: className }: { children?: Snippet; class?: string } = $props();
</script>

<h3 class={cn("mb-4 mt-5 text-2xl font-semibold uppercase underline decoration-icon decoration-4 [text-underline-position:under]", className)}>
  {@render children?.()}
</h3>
