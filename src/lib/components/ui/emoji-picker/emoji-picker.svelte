<script lang="ts">
  import { cn } from "$utils.js";
  import { Command as CommandPrimitive } from "bits-ui";
  import { box } from "svelte-toolbelt";
  import { MediaQuery } from "svelte/reactivity";
  import { useEmojiPicker } from "./emoji-picker.svelte.js";
  import type { EmojiPickerRootProps } from "./types";

  let {
    value = $bindable(""),
    skin = $bindable(0),
    onSelect = () => {},
    showRecents = false,
    recentsKey = "",
    maxRecents = 12,
    onSkinChange = () => {},
    class: className,
    children,
    ...rest
  }: EmojiPickerRootProps = $props();

  const wideScreen = new MediaQuery("min-width: 640px");

  const state = useEmojiPicker({
    value: box.with(
      () => value,
      (v) => (value = v)
    ),
    skin: box.with(
      () => skin,
      (v) => (skin = v)
    ),
    showRecents: box.with(() => showRecents),
    recentsKey: box.with(() => recentsKey),
    maxRecents: box.with(() => maxRecents),
    onSelect: box.with(() => onSelect),
    onSkinChange: box.with(() => onSkinChange)
  });
</script>

<CommandPrimitive.Root
  bind:this={state.command}
  {...rest}
  columns={wideScreen.current ? 6 : 4}
  shouldFilter={false}
  class={cn("max-w-xs", className)}
  onValueChange={state.onValueChange}>
  {@render children?.()}
</CommandPrimitive.Root>
