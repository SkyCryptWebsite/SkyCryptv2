<script lang="ts">
  import { SectionSubtitle } from "$lib/components/sections";
  import { cn } from "$lib/shared/utils";
  import type { Snippet } from "svelte";

  type Props = {
    subtitle?: string;
    class?: string;
    parentClass?: string;
    text?: Snippet;
    children?: Snippet;
    info?: Snippet;
  };

  let { subtitle, class: className, parentClass, text, children, info }: Props = $props();
</script>

<div class={cn("my-2 space-y-2", parentClass)}>
  {#if subtitle}
    <SectionSubtitle>{subtitle}</SectionSubtitle>
  {/if}
  {@render text?.()}

  {@render info?.()}
  <div class={cn("flex flex-wrap gap-4", className)}>
    {@render children?.()}
  </div>
</div>
