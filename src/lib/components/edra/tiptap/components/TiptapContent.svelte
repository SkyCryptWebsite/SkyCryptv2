<script lang="ts">
  import EditorContent from "./EditorContent.svelte";
  import { getEditor } from "./editorContext.js";

  let { class: className }: { class: string } = $props();

  const editor = getEditor();
</script>

<EditorContent {editor} class={className} />
