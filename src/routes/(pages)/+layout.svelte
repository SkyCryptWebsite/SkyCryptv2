<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<article class="mx-auto flex max-w-3xl flex-col px-[max(1.25rem,env(safe-area-inset-right))] py-8">
  <div
    class="typeset typeset-article rounded-xl border glass p-4 glass-brightness-150 glass-contrast-60 md:p-8 dark:glass-brightness-50 dark:glass-contrast-100">
    {@render children()}
  </div>
</article>
