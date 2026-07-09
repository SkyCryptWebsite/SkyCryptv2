<script lang="ts">
  import type { BlockImage } from "$types";

  const { block }: { block: BlockImage } = $props();

  // `media` is `string | Media` in the schema (an ID at depth 0); we always fetch
  // populated, so narrow to the object form.
  const media = $derived(typeof block.media === "string" ? null : block.media);
  const src = $derived(media?.sizes?.card?.url ?? media?.url ?? "");
  const width = $derived(media?.sizes?.card?.width ?? media?.width ?? undefined);
  const height = $derived(media?.sizes?.card?.height ?? media?.height ?? undefined);
  const alt = $derived(block.alt ?? media?.alt ?? "");
</script>

<figure class="my-4 flex flex-col items-center gap-2">
  <img {src} {alt} {width} {height} loading="lazy" class="h-auto max-w-full rounded-xl border" />
  {#if block.caption}
    <figcaption class="text-center text-sm text-muted-foreground italic">{block.caption}</figcaption>
  {/if}
</figure>
