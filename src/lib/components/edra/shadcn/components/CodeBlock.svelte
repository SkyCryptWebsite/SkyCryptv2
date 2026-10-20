<script lang="ts">
  import { Button, buttonVariants } from "$ui/button";
  import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "../../tiptap";

  const { editor, node, updateAttributes, extension }: NodeViewProps = $props();

  import * as Command from "$ui/command";
  import * as Popover from "$ui/popover";
  import { cn } from "$utils";
  import Check from "@lucide/svelte/icons/check";
  import Copy from "@lucide/svelte/icons/copy";
  import strings from "../../strings";
  import Tooltip from "./Tooltip.svelte";

  let preRef = $state<HTMLPreElement>();
  let isCopying = $state(false);
  const languages: string[] = $derived(extension.options.lowlight.listLanguages().sort());
  let defaultLanguage = $derived<string>(node.attrs.language ?? "plaintext");

  const changeLanguage = (language: string) => {
    updateAttributes({ language: language });
    defaultLanguage = language;
  };

  function copyCode() {
    if (!preRef) return;
    isCopying = true;
    navigator.clipboard.writeText(preRef.innerText);
    setTimeout(() => {
      isCopying = false;
    }, 1000);
  }
</script>

<NodeViewWrapper class="my-4 rounded-lg bg-muted pb-4 dark:bg-muted/20">
  <div class="mx-2 flex items-center justify-end gap-2 print:justify-start" contenteditable="false">
    <Popover.Root>
      <Tooltip tooltip="Change Language">
        <Popover.Trigger
          contenteditable="false"
          disabled={!editor.isEditable}
          class={buttonVariants({
            variant: "ghost",
            size: "sm",
            class: "text-muted-foreground capitalize"
          })}>
          {defaultLanguage}
        </Popover.Trigger>
      </Tooltip>
      <Popover.Content
        class="max-h-96 w-42 p-0! text-primary!"
        portalProps={{ disabled: true, to: undefined }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onEscapeKeydown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}>
        <Command.Root class="p-0!">
          <Command.Input placeholder={strings.extension.code.searchLanguagePlaceholder} />
          <Command.List>
            <Command.Empty>{strings.extension.code.searchLanguageEmpty}</Command.Empty>
            <Command.Group value="languages">
              {#each languages as language (language)}
                <Command.Item
                  value={language}
                  onSelect={() => changeLanguage(language)}
                  onclick={() => changeLanguage(language)}
                  class="text-primary capitalize">
                  <Check class={cn(language !== defaultLanguage && "invisible")} />
                  {language}
                </Command.Item>
              {/each}
            </Command.Group>
          </Command.List>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
    <Button variant="ghost" size="icon-xs" class="text-muted-foreground print:hidden" onclick={copyCode}>
      {#if isCopying}
        <Check class="text-primary" />
      {:else}
        <Copy />
      {/if}
    </Button>
  </div>
  <pre bind:this={preRef} draggable={false} spellcheck="false">
		<NodeViewContent as="code" class={`language-${defaultLanguage}`} {...node.attrs} />
	</pre>
</NodeViewWrapper>
