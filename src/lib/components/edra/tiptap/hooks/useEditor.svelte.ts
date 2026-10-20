import { browser } from "$app/env";
import type { EditorOptions } from "@tiptap/core";
import { Editor } from "../Editor";

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  let editor: Editor | undefined = undefined;

  if (browser) {
    editor = new Editor(options);
  }

  $effect(() => {
    return () => {
      if (editor) {
        const nodes = editor.view.dom?.parentNode;
        const newEl = nodes?.cloneNode(true) as HTMLElement;
        nodes?.parentNode?.replaceChild(newEl, nodes);
        editor.destroy();
      }
    };
  });

  return editor;
};
