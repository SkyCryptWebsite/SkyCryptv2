import { Tiptap } from "../tiptap/index.ts";
import Toolbar from "./components/Toolbar.svelte";
import DragHandle from "./drag-handle.svelte";
import Editor from "./editor.svelte";
export { createEditor } from "./editor.ts";
export * from "@tiptap/core";
import BubbleMenu from "./components/menu/BubbleMenu.svelte";
import ToC from "./toc.svelte";

const Edra = Object.assign(Tiptap, {
  Content: Editor,
  Toolbar,
  BubbleMenu,
  DragHandle,
  ToC
});
export { Edra };
