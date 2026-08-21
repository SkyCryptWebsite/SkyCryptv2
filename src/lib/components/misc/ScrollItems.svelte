<script lang="ts">
  import ScrollAreaPrimitive from "$lib/components/ScrollAreaPrimitive.svelte";
  import { ScrollArea } from "bits-ui";
  import type { Snippet } from "svelte";

  type Props = {
    children?: Snippet;
  };
  let { children }: Props = $props();
</script>

<ScrollAreaPrimitive class="relative max-w-full" viewClass="max-md:pb-4" type="auto" orientation="horizontal">
  {#snippet viewportChildren()}
    <div class="flex! flex-nowrap gap-4 md:flex-wrap">
      {@render children?.()}
    </div>
  {/snippet}
  <ScrollArea.Scrollbar
    orientation="horizontal"
    class="flex h-2.5 w-full touch-none rounded-full transition-all ease-out select-none md:hidden">
    <ScrollArea.Thumb class="flex rounded-full bg-primary" />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollAreaPrimitive>
