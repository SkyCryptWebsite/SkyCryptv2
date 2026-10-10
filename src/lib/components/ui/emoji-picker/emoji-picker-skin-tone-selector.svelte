<script lang="ts">
  import { buttonVariants } from "$ui/button";
  import { cn } from "$utils.js";
  import { box } from "svelte-toolbelt";
  import { useEmojiPickerSkinToneSelector } from "./emoji-picker.svelte.js";
  import type { EmojiPickerSkinProps } from "./types.js";

  let {
    previewEmoji = "👋",
    variant = "outline",
    size = "icon",
    class: className,
    onclick,
    ...rest
  }: EmojiPickerSkinProps = $props();

  const skinState = useEmojiPickerSkinToneSelector({
    previewEmoji: box.with(() => previewEmoji)
  });
</script>

<button
  type="button"
  data-slot="button"
  aria-label="Change skin tone"
  {...rest}
  class={cn(buttonVariants({ variant, size }), "size-11", className)}
  onclick={(e) => {
    onclick?.(e);
    skinState.cycleSkinTone();
  }}>
  {skinState.preview}
</button>
