<script lang="ts">
  import type { BlockRichText } from "$types";

  type RenderedBlockRichText = BlockRichText & { html?: string };

  const { block }: { block: RenderedBlockRichText } = $props();

  const html = $derived(block.html ?? "");
</script>

<div class="newsroom-rich-text">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML is generated from trusted Payload Lexical JSON via richTextToHtml(), which escapes text and sanitizes custom hrefs. -->
  {@html html}
</div>

<style>
  .newsroom-rich-text :global(p) {
    margin-block: 0.75rem;
    line-height: 1.75rem;
  }

  .newsroom-rich-text :global(p:first-child) {
    margin-top: 0;
  }

  .newsroom-rich-text :global(h1) {
    margin-block: 2rem 0.75rem;
    font-size: 1.875rem;
    line-height: 1.25;
    font-weight: 700;
    color: var(--color-foreground);
  }

  .newsroom-rich-text :global(h2) {
    margin-block: 2rem 0.75rem;
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
    color: var(--color-foreground);
  }

  .newsroom-rich-text :global(h3) {
    margin-block: 1.5rem 0.5rem;
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 700;
    color: var(--color-foreground);
  }

  .newsroom-rich-text :global(h4) {
    margin-block: 1.5rem 0.5rem;
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 700;
    color: var(--color-foreground);
  }

  .newsroom-rich-text :global(h5) {
    margin-block: 1.5rem 0.5rem;
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 700;
    color: var(--color-foreground);
  }

  .newsroom-rich-text :global(h6) {
    margin-block: 1.5rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 700;
    text-transform: uppercase;
    color: color-mix(in oklch, var(--color-foreground) 70%, transparent);
  }

  .newsroom-rich-text :global(blockquote) {
    margin-block: 0.75rem;
    border-left: 4px solid var(--color-border);
    padding-left: 1rem;
    color: color-mix(in oklch, var(--color-foreground) 80%, transparent);
    font-style: italic;
  }

  .newsroom-rich-text :global(hr) {
    margin-block: 1.5rem;
    border-color: var(--color-border);
  }

  .newsroom-rich-text :global(code) {
    border-radius: 0.25rem;
    background: var(--color-background);
    padding: 0.125rem 0.375rem;
    font-family: var(--font-mono);
    font-size: 0.875em;
  }
</style>
