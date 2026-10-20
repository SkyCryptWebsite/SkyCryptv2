import type { Content, EditorOptions, Extensions } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TableOfContents, { getHierarchicalIndexes } from "@tiptap/extension-table-of-contents";
import { all, createLowlight } from "lowlight";
import { getDefaultExtensions } from "../extensions";
import {
  Callout,
  IFrameExtended,
  ImageExtended,
  SlashCommand,
  SvelteNodeViewRenderer,
  useEditor,
  VideoExtended
} from "../tiptap";
import { MediaPlaceholder } from "../tiptap/extensions/MediaPlaceHolder";
import CalloutComp from "./components/Callout.svelte";
import CodeBlock from "./components/CodeBlock.svelte";
import IFrameComp from "./components/IFrame.svelte";
import ImageExtendedComp from "./components/ImageExtended.svelte";
import MediaPlaceholderComp from "./components/MediaPlaceHolder.svelte";
import SlashCommandComp from "./components/SlashCommand.svelte";
import VideoExtendedComp from "./components/VideoExtended.svelte";
import { setTocItems } from "./toc.svelte";

const lowlight = createLowlight(all);

export interface EdraEditorProps {
  /** Initial document, usually stored `editor.getJSON()` output. */
  content?: Content;
  extensions?: Extensions;
  /** Receives `{ editor, transaction }`; read the document with `editor.getJSON()`. */
  onUpdate?: EditorOptions["onUpdate"];
  /**
   * When true, disables StarterKit history (undo/redo) for use with Yjs Collaboration. Required because Collaboration
   * handles its own history.
   */
  collaborative?: boolean;
  /**
   * Callback function to handle file uploads when a user drags/drops, pastes, or selects a media file (image, video,
   * audio) to insert. It should upload the file to your storage (e.g., S3, Vercel Blob, etc.) and return a promise
   * resolving to the public URL of the uploaded file.
   *
   * @param file The file to be uploaded.
   * @returns A promise resolving to the uploaded file's URL.
   */
  onFileUpload?: (file: File) => Promise<string>;
}

export const createEditor = (props?: EdraEditorProps) =>
  useEditor({
    content: props?.content ?? "",
    extensions: [
      ...getDefaultExtensions({ undoRedo: !props?.collaborative }),
      ...(props?.extensions || []),
      CodeBlockLowlight.configure({ lowlight }).extend({
        addNodeView: () => SvelteNodeViewRenderer(CodeBlock)
      }),
      MediaPlaceholder.configure({ onUpload: props?.onFileUpload }).extend({
        addNodeView: () => SvelteNodeViewRenderer(MediaPlaceholderComp)
      }),
      ImageExtended.extend({ addNodeView: () => SvelteNodeViewRenderer(ImageExtendedComp) }),
      VideoExtended.extend({ addNodeView: () => SvelteNodeViewRenderer(VideoExtendedComp) }),
      IFrameExtended.extend({ addNodeView: () => SvelteNodeViewRenderer(IFrameComp) }),
      Callout.extend({ addNodeView: () => SvelteNodeViewRenderer(CalloutComp) }),
      SlashCommand(SlashCommandComp),
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate: (indexes) => {
          setTocItems(indexes);
        }
      })
    ],
    onUpdate: props?.onUpdate ?? (() => {})
  });
