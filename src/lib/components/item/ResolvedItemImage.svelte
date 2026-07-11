<script lang="ts">
  import { resolveItemTexture, type ResolvedItemTexture } from "$lib/shared/items/resolve-item-texture";
  import { Avatar } from "bits-ui";
  import { getAbortSignal } from "svelte";

  type Props = {
    src?: string;
    alt?: string;
    class?: string;
    loading?: "eager" | "lazy";
    enchanted?: boolean;
    onresolved?: (resolution: ResolvedItemTexture) => void;
  };

  let { src = "", alt = "", class: className, loading = "lazy", enchanted, onresolved }: Props = $props();
  let resolvedSrc = $state("");

  $effect(() => {
    const textureUrl = src;
    resolvedSrc = textureUrl;
    if (!textureUrl) return;

    const signal = getAbortSignal();
    resolveItemTexture(textureUrl).then((resolution) => {
      if (signal.aborted) return;
      resolvedSrc = resolution.texture;
      onresolved?.(resolution);
    });
  });
</script>

<Avatar.Image {loading} src={resolvedSrc} {alt} class={className} data-enchanted={enchanted} />
