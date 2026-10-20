// Must stay free of `.svelte` imports (directly or transitively): it is imported in Node
// by `getSchema` / `@tiptap/static-renderer` to validate and render stored content.
import { Extension, type Extensions, type JSONContent } from "@tiptap/core";
import Highlight from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Subscript from "@tiptap/extension-subscript";
import SuperScript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontSize, TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import strings from "./strings";
import { Audio } from "./tiptap/extensions/audio";
import { Callout } from "./tiptap/extensions/Callout";
import ColorHighlighter from "./tiptap/extensions/ColorHighlighter";
import { IFrameExtended } from "./tiptap/extensions/iframe";
import { ImageExtended } from "./tiptap/extensions/image/ImageExtended";
import { SelectAcrossAtoms } from "./tiptap/extensions/SelectAcrossAtoms";
import { Table, TableCell, TableHeader, TableRow } from "./tiptap/extensions/table";
import { VideoExtended } from "./tiptap/extensions/video/VideoExtended";

interface SharedOptions {
  /** Editor-only plugins from StarterKit (history, cursors, trailing node). */
  editor: boolean;
  undoRedo?: boolean;
}

/** Nodes and marks shared by the editor and the content schema. */
function sharedExtensions({ editor, undoRedo = true }: SharedOptions): Extensions {
  return [
    StarterKit.configure({
      undoRedo: editor && undoRedo ? undefined : false,
      dropcursor: editor ? undefined : false,
      gapcursor: editor ? undefined : false,
      trailingNode: editor ? undefined : false,
      orderedList: { HTMLAttributes: { class: "list-decimal" } },
      bulletList: { HTMLAttributes: { class: "list-disc" } },
      heading: { levels: [1, 2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" }
      },
      // The editor swaps in CodeBlockLowlight (same `codeBlock` node, same `language` attr).
      codeBlock: editor ? false : undefined
    }),
    Audio,
    Highlight.configure({ multicolor: true }),
    Color,
    Subscript,
    SuperScript,
    TextStyle,
    FontSize,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table,
    TableHeader,
    TableRow,
    TableCell
  ];
}

/** Same heading attributes the editor's TableOfContents extension adds, without its plugin. */
const TocAttributes = Extension.create({
  name: "tocAttributes",
  addGlobalAttributes() {
    return [
      {
        types: ["heading"],
        attributes: {
          id: { default: null, renderHTML: (attributes) => ({ id: attributes.id }) },
          "data-toc-id": {
            default: null,
            renderHTML: (attributes) => ({ "data-toc-id": attributes["data-toc-id"] })
          }
        }
      }
    ];
  }
});

/**
 * Every node and mark the editor can persist, without node views or editor-only plugins. Safe to import on the server:
 * `getSchema(getContentExtensions())`.
 */
export function getContentExtensions(): Extensions {
  return [...sharedExtensions({ editor: false }), ImageExtended, VideoExtended, IFrameExtended, Callout, TocAttributes];
}

/**
 * Replaces transient editor-only nodes (unfilled media placeholders) with empty paragraphs so `editor.getJSON()` output
 * validates against `getContentExtensions()`.
 */
export function stripTransientNodes(content: JSONContent): JSONContent {
  if (content.type === "mediaPlaceholder") return { type: "paragraph" };
  if (!content.content) return content;
  return { ...content, content: content.content.map(stripTransientNodes) };
}

export interface DefaultExtensionsOptions {
  /** Whether to enable history (undo/redo). Disabled for collaboration (Yjs) */
  undoRedo?: boolean;
}

/** Editor extensions minus the nodes that get Svelte node views in `shadcn/editor.ts`. */
export function getDefaultExtensions(options: DefaultExtensionsOptions = {}): Extensions {
  return [
    ...sharedExtensions({ editor: true, undoRedo: options.undoRedo }),
    CharacterCount,
    Placeholder.configure({
      emptyEditorClass: "is-empty",
      placeholder: ({ node }) => {
        if (node.type.name === "heading") return strings.editor.headingPlaceholder;
        if (node.type.name === "paragraph") return strings.editor.paragraphPlaceholder;
        return "";
      }
    }),
    Typography,
    ColorHighlighter,
    Markdown,
    // Drag-select across images/media; decorate selected atoms; keep selection on right-click
    SelectAcrossAtoms
  ];
}
