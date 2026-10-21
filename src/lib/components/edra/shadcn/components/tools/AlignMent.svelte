<script lang="ts">
  import { buttonVariants } from "$ui/button";
  import * as DropdownMenu from "$ui/dropdown-menu";
  import { cn } from "$utils";
  import AlignLeft from "@lucide/svelte/icons/align-left";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import { commands } from "../../../commands";
  import { getEditor, useEditorTransaction } from "../../../tiptap";
  import Tooltip from "../Tooltip.svelte";

  const alignments = commands["alignment"];

  const editor = getEditor();
  const transaction = useEditorTransaction(editor);

  const isActive = () => {
    void transaction.version;
    return alignments.find((h) => h.isActive?.(editor)) !== undefined;
  };

  const AlignmentIcon = () => {
    void transaction.version;
    const h = alignments.find((h) => h.isActive?.(editor));
    return h ? h.icon : AlignLeft;
  };
</script>

<DropdownMenu.Root>
  <Tooltip tooltip="Alignment">
    <DropdownMenu.Trigger
      class={buttonVariants({
        variant: "ghost",
        size: "icon",
        class: cn(isActive() && "bg-muted")
      })}>
      {@const Icon = AlignmentIcon()}
      <Icon />
      <ChevronDown class="size-2! text-muted-foreground" />
    </DropdownMenu.Trigger>
  </Tooltip>
  <DropdownMenu.Content class="w-fit" portalProps={{ to: editor.view.dom.parentElement ?? undefined }}>
    <DropdownMenu.Label>Alignments</DropdownMenu.Label>
    {#each alignments as alignment (alignment)}
      {@const Icon = alignment.icon}
      <DropdownMenu.Item onclick={() => alignment.onClick?.(editor)}>
        <Icon />
        {alignment.tooltip}
        <DropdownMenu.Shortcut>
          {alignment.shortCut}
        </DropdownMenu.Shortcut>
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
