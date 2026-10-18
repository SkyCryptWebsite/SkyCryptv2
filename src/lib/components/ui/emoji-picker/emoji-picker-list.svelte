<script lang="ts">
  import * as Command from "$components/ui/command";
  import { cn } from "$utils.js";
  import data, { type EmojiMartData } from "@emoji-mart/data";
  import { Command as CommandPrimitive } from "bits-ui";
  import { box } from "svelte-toolbelt";
  import { makeValue, parseValue, useEmojiPickerList } from "./emoji-picker.svelte.js";
  import type { EmojiPickerListProps } from "./types";

  let {
    ref = $bindable(null),
    emptyMessage = "No results.",
    allowedEmojis,
    class: className,
    ...rest
  }: EmojiPickerListProps = $props();

  const emojiData = data as EmojiMartData;

  const pickerState = useEmojiPickerList({ allowedEmojis: box.with(() => allowedEmojis) });

  function loadMore(node: HTMLElement) {
    // Reobserve after each page so a tall viewport keeps filling while the sentinel is visible.
    pickerState.visibleGroups.remaining;
    const observer = new IntersectionObserver(
      (entries) => {
        if (ref && entries.some((entry) => entry.isIntersecting)) pickerState.showMore(ref);
      },
      { root: ref, rootMargin: "88px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }
</script>

<Command.List bind:ref class={cn("relative h-[200px]", className)} {...rest}>
  <Command.Empty class="absolute inset-0 flex place-items-center justify-center py-0">
    {emptyMessage}
  </Command.Empty>
  {#if pickerState.recents.length > 0}
    <CommandPrimitive.Group>
      <CommandPrimitive.GroupHeading class="px-2 py-1 text-xs text-muted-foreground capitalize">
        Recents
      </CommandPrimitive.GroupHeading>
      <CommandPrimitive.GroupItems class="grid grid-cols-4 px-2 sm:grid-cols-6">
        {#each pickerState.recents as item (item)}
          {@const { name, skin } = parseValue(item)}
          {@const emoji = emojiData.emojis[name].skins[skin].native}
          <Command.Item
            class="flex aspect-square size-11 place-items-center justify-center text-lg [&_svg]:hidden!"
            aria-label={emojiData.emojis[name].name}
            value="{item}:recent"
            onSelect={() => {
              pickerState.select(item);
              pickerState.root.frecency?.use(item);
            }}>
            {emoji}
          </Command.Item>
        {/each}
      </CommandPrimitive.GroupItems>
    </CommandPrimitive.Group>
  {/if}
  {#each pickerState.visibleGroups.groups as category (category.id)}
    <CommandPrimitive.Group>
      <CommandPrimitive.GroupHeading class="px-2 py-1 text-xs text-muted-foreground capitalize">
        {category.id}
      </CommandPrimitive.GroupHeading>
      <CommandPrimitive.GroupItems class="grid grid-cols-4 px-2 sm:grid-cols-6">
        {#each category.emojis as item (item)}
          {@const emoji = emojiData.emojis[item]}
          {@const emojiSkin = emoji.skins.length > 1 ? pickerState.skinIndex : 0}
          {@const key = makeValue(item, emojiSkin)}
          <Command.Item
            class="flex aspect-square size-11 place-items-center justify-center text-lg [&_svg]:hidden!"
            aria-label={emoji.name}
            value={item}
            onSelect={() => {
              pickerState.select(key);
              pickerState.root.frecency?.use(key);
            }}>
            {emoji.skins[emojiSkin].native}
          </Command.Item>
        {/each}
      </CommandPrimitive.GroupItems>
    </CommandPrimitive.Group>
  {/each}
  {#if pickerState.visibleGroups.remaining > 0}
    <div {@attach loadMore} class="h-px w-full" aria-hidden="true"></div>
  {/if}
</Command.List>
