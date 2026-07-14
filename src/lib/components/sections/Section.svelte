<script lang="ts">
  import { SectionSubtitle, SectionTitle } from "$lib/components/sections";
  import type { SectionName } from "$lib/sections/types";
  import { Separator } from "$ui/separator";
  import { cn } from "$utils";
  import type { Snippet } from "svelte";

  type Props = {
    id: SectionName | "Catacombs" | "Master_Catacombs";
    class?: string;
    order?: number;
    children?: Snippet;
    subtitle?: Snippet;
    subtitleText?: string;
    showSectionTitle?: boolean;
  };

  let { id, class: className, order, children, subtitle, subtitleText, showSectionTitle = false }: Props = $props();
</script>

<section {id} class={cn("order-(--order) mx-auto scroll-m-32", className)} style="--order: {order};">
  {#if subtitle || subtitleText || showSectionTitle}
    <div class="flex items-center justify-between">
      {#if subtitle}
        {@render subtitle()}
      {:else if subtitleText}
        <SectionSubtitle>{subtitleText}</SectionSubtitle>
      {:else if showSectionTitle}
        <SectionTitle>{id.replaceAll("_", " ")}</SectionTitle>
      {/if}
    </div>
  {/if}
  {#if showSectionTitle}
    <Separator class="my-4 w-full bg-primary data-[orientation=horizontal]:h-1" />
  {/if}

  {@render children?.()}
</section>
