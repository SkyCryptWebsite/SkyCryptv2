<script lang="ts">
  import type { Block } from "$types";
  import Image from "./lexical/elements/Image.svelte";
  import RichText from "./lexical/elements/RichText.svelte";

  const { body }: { body: Block[] } = $props();
</script>

<div class="typeset typeset-article max-w-[37em]">
  {#each body as block, i (block.id ?? i)}
    {#if block.blockType === "image"}
      <Image {block} />
    {:else if block.blockType === "richText"}
      <RichText {block} />
    {/if}
  {/each}
</div>
