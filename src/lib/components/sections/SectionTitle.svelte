<script lang="ts">
  import { cn } from "$lib/shared/utils";
  import type { Snippet } from "svelte";

  let { text, children, class: className }: { text?: string; children?: Snippet; class?: string } = $props();
</script>

<h3 class={cn("mt-4 text-2xl font-semibold uppercase", className)}>
  {#if children}
    {@render children()}
  {:else if text}
    {text}
  {/if}
</h3>
