<script lang="ts">
  const { html }: { html: string } = $props();
</script>

<div class="typeset typeset-article max-w-[37em]">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered on the server from the editor schema, see renderContent. -->
  {@html html}
</div>
