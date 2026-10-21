import { Video } from "./Video";

/** Base video node; the editor adds its Svelte node view in `shadcn/editor.ts`. */
export const VideoExtended = Video.extend({
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
});
