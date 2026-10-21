<script lang="ts">
  import { type Snippet } from "svelte";
  import type { Editor } from "../Editor";
  import { setEditor } from "./editorContext";

  let { editor, children }: { editor: Editor | undefined; children?: Snippet } = $props();

  if (editor) {
    setEditor(editor);
  }
</script>

{#if editor && children}
  {@render children()}
{/if}
