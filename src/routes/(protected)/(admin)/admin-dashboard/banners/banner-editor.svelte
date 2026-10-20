<script lang="ts">
  import { Button } from "$ui/button";
  import BoldIcon from "@lucide/svelte/icons/bold";
  import ItalicIcon from "@lucide/svelte/icons/italic";
  import StrikethroughIcon from "@lucide/svelte/icons/strikethrough";
  import UnderlineIcon from "@lucide/svelte/icons/underline";
  import type { JSONContent } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import LinkTool from "#lib/components/edra/shadcn/components/tools/Link.svelte";
  import { Tiptap, useEditor, useEditorTransaction } from "#lib/components/edra/tiptap";

  type Props = { content: JSONContent; onchange: (content: JSONContent) => void; id?: string };
  let { content, onchange, id }: Props = $props();

  // Only what the server allows in banners: paragraphs, line breaks, inline formatting and links.
  // svelte-ignore state_referenced_locally
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true }
      })
    ],
    editorProps: { attributes: { class: "min-h-16 px-3 py-2 text-sm outline-none", ...(id ? { id } : {}) } },
    onUpdate: ({ editor }) => onchange(editor.getJSON())
  });

  // The editor only exists in the browser.
  const transaction = editor ? useEditorTransaction(editor) : null;
  const isActive = (name: string) => {
    void transaction?.version;
    return !!editor?.isActive(name);
  };

  const marks = [
    { name: "bold", label: "Bold", icon: BoldIcon },
    { name: "italic", label: "Italic", icon: ItalicIcon },
    { name: "underline", label: "Underline", icon: UnderlineIcon },
    { name: "strike", label: "Strikethrough", icon: StrikethroughIcon }
  ] as const;
</script>

{#if editor}
  <div class="rounded-lg border focus-within:ring-2 focus-within:ring-ring">
    <Tiptap {editor}>
      <div class="flex items-center gap-1 border-b p-1">
        {#each marks as mark (mark.name)}
          {@const active = isActive(mark.name)}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={mark.label}
            aria-pressed={active}
            class={active ? "bg-muted text-primary" : ""}
            onclick={() => editor.chain().focus().toggleMark(mark.name).run()}>
            <mark.icon />
          </Button>
        {/each}
        <LinkTool />
      </div>
      <Tiptap.Content class="" />
    </Tiptap>
  </div>
{/if}
