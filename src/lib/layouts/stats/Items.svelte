<script lang="ts">
  import SectionSubtitle from "$lib/components/SectionSubtitle.svelte";
  import SectionTitle from "$lib/components/SectionTitle.svelte";
  import { cn } from "$lib/shared/utils";

  export let title: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;

  let className: string | undefined = undefined;
  export { className as class };
</script>

<div class="space-y-4">
  {#if title}
    <SectionTitle>{title}</SectionTitle>
  {/if}
  {#if subtitle}
    <SectionSubtitle>{subtitle}</SectionSubtitle>
  {/if}
  <slot name="text" />

  <div class={cn("flex flex-wrap gap-3", className)}>
    <slot />
  </div>

  <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
    <slot name="info" />
  </p>
</div>
