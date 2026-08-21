<script lang="ts">
  import { cn } from "$lib/shared/utils";
  import type { Snippet } from "svelte";

  let { text, children, class: className }: { text?: string; children?: Snippet; class?: string } = $props();
</script>

<h4 class={cn("text-xl font-semibold text-foreground capitalize", className)}>
  {#if children}
    {@render children()}
  {:else if text}
    {text}
  {/if}
</h4>
