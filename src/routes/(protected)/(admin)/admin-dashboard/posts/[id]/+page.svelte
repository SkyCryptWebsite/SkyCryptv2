<script lang="ts">
  import type { PageProps } from "./$types";
  import PostEditor from "./post-editor.svelte";

  let { params }: PageProps = $props();
</script>

<!-- A fresh editor per post, so local edits never carry over to another post. -->
{#key params.id}
  <PostEditor id={params.id} />
{/key}
