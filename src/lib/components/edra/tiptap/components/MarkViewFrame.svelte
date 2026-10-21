<script lang="ts">
  import type { Component as SvelteComponent } from "svelte";

  let {
    component: Component,
    extension,
    ...props
  }: {
    component: SvelteComponent;
    extension?: { name?: string };
    [key: string]: unknown;
  } = $props();

  // eslint-disable-next-line shadcn/no-unknown-classes
  let className = $derived(`svelte-renderer mark-${extension?.name || "unknown"}`);
</script>

<div class={className} data-mark-view-wrapper="">
  <Component {extension} {...props} />
</div>
