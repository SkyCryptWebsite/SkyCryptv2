<script lang="ts">
  import type { BlockRichText } from "$types";

  type RenderedBlockRichText = BlockRichText & { html?: string };

  const { block }: { block: RenderedBlockRichText } = $props();

  const html = $derived(block.html ?? "");
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML is generated from trusted Payload Lexical JSON via richTextToHtml(), which escapes text and sanitizes custom hrefs. -->
{@html html}
