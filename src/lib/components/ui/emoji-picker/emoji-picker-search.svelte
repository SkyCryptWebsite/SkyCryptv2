<script lang="ts">
  import * as Command from "$ui/command";
  import { box } from "svelte-toolbelt";
  import { useEmojiPickerInput } from "./emoji-picker.svelte.js";
  import type { EmojiPickerSearchProps } from "./types";

  let { value = $bindable(""), placeholder = "Search", ...rest }: EmojiPickerSearchProps = $props();

  useEmojiPickerInput({
    value: box.with(
      () => value,
      (v) => (value = v)
    )
  });
</script>

<Command.Input {...rest} {placeholder} bind:value />
