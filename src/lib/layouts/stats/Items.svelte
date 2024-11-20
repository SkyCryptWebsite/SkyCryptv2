<script lang="ts">
  import { cn } from "$lib/utils";

  export let title: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;

  let className: string | undefined = undefined;
  export { className as class };
</script>

<div class="space-y-4">
  {#if title}
    <h3 class="text-2xl capitalize">{title}</h3>
  {/if}
  {#if subtitle}
    <h4 class="text-xl capitalize text-text">{subtitle}</h4>
  {/if}
  <slot name="text" />

  <div class={cn("flex flex-wrap gap-4", className)}>
    <slot />
  </div>

  <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
    <slot name="info" />
  </p>
</div>
