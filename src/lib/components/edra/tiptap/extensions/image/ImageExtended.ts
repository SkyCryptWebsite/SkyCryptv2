import Image from "@tiptap/extension-image";

/** Base image node; the editor adds its Svelte node view in `shadcn/editor.ts`. */
export const ImageExtended = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null
      },
      alt: {
        default: null
      },
      title: {
        default: null
      },
      width: {
        default: "100%"
      },
      height: {
        default: null
      },
      align: {
        default: "left"
      }
    };
  }
}).configure({
  allowBase64: false
});
