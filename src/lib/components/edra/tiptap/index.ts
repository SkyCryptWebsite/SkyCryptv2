import TiptapRoot from "./components/Tiptap.svelte";
import TiptapContent from "./components/TiptapContent.svelte";

export { default as EditorContent } from "./components/EditorContent.svelte";
export { getEditor } from "./components/editorContext";
export { default as MarkViewContent } from "./components/MarkViewContent.svelte";
export { default as NodeViewContent } from "./components/NodeViewContent.svelte";
export { default as NodeViewWrapper } from "./components/NodeViewWrapper.svelte";
export { Editor } from "./Editor";
export { useEditor } from "./hooks/useEditor.svelte.js";
export { useEditorState } from "./hooks/useEditorState.svelte.js";
export { useEditorTransaction } from "./hooks/useEditorTransaction.svelte.js";
export { SvelteMarkViewRenderer } from "./renderers/SvelteMarkViewRenderer";
export { SvelteNodeViewRenderer } from "./renderers/SvelteNodeViewRenderer";
export { SvelteRenderer } from "./renderers/SvelteRenderer.svelte.js";

export const Tiptap = Object.assign(TiptapRoot, { Content: TiptapContent });

export * from "@tiptap/core";

export * from "./extensions";
export * from "./components/menus";
