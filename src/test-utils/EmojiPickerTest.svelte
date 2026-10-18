<script lang="ts">
  import * as EmojiPicker from "$ui/emoji-picker";
  import type { SelectedEmoji } from "$ui/emoji-picker";
  import * as Popover from "$ui/popover";
  import "../routes/layout.css";

  let {
    allowedEmojis,
    showRecents = false,
    inPopover = false,
    onSelect = () => {}
  }: {
    allowedEmojis?: string[];
    showRecents?: boolean;
    inPopover?: boolean;
    onSelect?: (emoji: SelectedEmoji) => void;
  } = $props();
</script>

{#snippet picker()}
  <EmojiPicker.Root
    {...showRecents ? { showRecents: true, recentsKey: "emoji-picker-performance-test" } : { showRecents: false }}
    {onSelect}>
    <EmojiPicker.Search aria-label="Search emojis" />
    <EmojiPicker.List {allowedEmojis} />
    <EmojiPicker.Footer>
      {#snippet children({ active })}
        <div aria-label="Emoji preview">{active?.emoji} {active?.data.name}</div>
      {/snippet}
    </EmojiPicker.Footer>
    <EmojiPicker.SkinToneSelector aria-label="Change skin tone" />
  </EmojiPicker.Root>
{/snippet}

{#if inPopover}
  <Popover.Root>
    <Popover.Trigger>Open picker</Popover.Trigger>
    <Popover.Content>{@render picker()}</Popover.Content>
  </Popover.Root>
{:else}
  {@render picker()}
{/if}
