import { UseFrecency } from "$hooks/use-frecency.svelte";
import data, { type EmojiMartData } from "@emoji-mart/data";
import { Context, watch } from "runed";
import { tick } from "svelte";
import type { ReadableBoxedValues, WritableBoxedValues } from "svelte-toolbelt";
import type { EmojiPickerSkin, SelectedEmoji } from "./types";

const emojiData = data as EmojiMartData;
const RENDER_PAGE_SIZE = 120;
const emojiKeywords = Object.fromEntries(
  Object.entries(emojiData.emojis).map(([name, emoji]) => [
    name,
    [emoji.id, emoji.name, ...emoji.keywords].map((keyword) => keyword.toLowerCase())
  ])
);

type EmojiPickerState = {
  search: string;
  active: SelectedEmoji | null;
};

const defaultState: EmojiPickerState = {
  search: "",
  active: null
};

type EmojiPickerRootProps = WritableBoxedValues<{
  value: string;
  skin: EmojiPickerSkin;
}> &
  ReadableBoxedValues<{
    onSelect: (emoji: SelectedEmoji) => void;
    showRecents: boolean;
    recentsKey: string;
    maxRecents: number;
    onSkinChange: (skin: EmojiPickerSkin) => void;
  }>;

class EmojiPickerRootState {
  emojiPickerState = $state({ ...defaultState });
  frecency: UseFrecency | null;
  command = $state.raw<{ getValidItems: () => HTMLElement[]; updateSelectedToIndex: (index: number) => void }>();

  constructor(readonly opts: EmojiPickerRootProps) {
    this.select = this.select.bind(this);
    this.onValueChange = this.onValueChange.bind(this);

    if (this.opts.showRecents.current) {
      if (!this.opts.recentsKey.current) throw new Error("[emoji-picker] recentsKey is required when recents is true");

      this.frecency = new UseFrecency(this.opts.recentsKey.current, {}, { maxItems: this.opts.maxRecents.current });
    } else {
      this.frecency = null;
    }
  }

  select(emoji: string) {
    const { name, skin } = parseValue(emoji);

    const selected = {
      emoji: emojiData.emojis[name].skins[skin].native,
      data: emojiData.emojis[name],
      skin
    };

    this.opts.value.current = selected.emoji;

    this.opts.onSelect.current(selected);
  }

  onValueChange(value: string) {
    if (value === "") {
      this.emojiPickerState.active = null;
      return;
    }

    const { name, skin } = parseValue(value);

    const emojiSkin = skin ? skin : this.opts.skin.current;

    const data = emojiData.emojis[name];

    if (data.skins.length === 1) {
      this.emojiPickerState.active = {
        emoji: data.skins[0].native,
        data: data,
        skin: 0
      };
      return;
    }

    this.emojiPickerState.active = {
      emoji: data.skins[emojiSkin].native,
      data: data,
      skin: emojiSkin
    };
  }
}

export function parseValue(emojiKey: string): { name: string; skin: number } {
  const [name, skin] = emojiKey.split(":");
  return { name, skin: skin ? Number(skin) : 0 };
}

export function makeValue(name: string, skin: number) {
  return `${name}:${skin}`;
}

type EmojiPickerListProps = ReadableBoxedValues<{
  allowedEmojis: string[] | undefined;
}>;

class EmojiPickerListState {
  renderLimit = $state(RENDER_PAGE_SIZE);
  loadingMore = false;
  queuedMore = false;
  search = $derived.by(() => this.root.emojiPickerState.search.trim().toLowerCase());
  allowedEmojis = $derived.by(() =>
    this.opts.allowedEmojis.current ? new Set(this.opts.allowedEmojis.current) : null
  );

  filteredCategories = $derived.by(() => {
    const search = this.search;
    const allowedEmojis = this.allowedEmojis;
    return emojiData.categories
      .map((category) => ({
        id: category.id,
        emojis: category.emojis.filter((name) => this.matches(name, search, allowedEmojis))
      }))
      .filter((category) => category.emojis.length > 0);
  });

  recents = $derived.by(() => {
    if (!this.showRecents) return [];
    const search = this.search;
    const allowedEmojis = this.allowedEmojis;
    return (this.root.frecency?.items ?? [])
      .filter((item) => this.matches(parseValue(item).name, search, allowedEmojis))
      .slice(0, this.maxRecents);
  });

  visibleGroups = $derived.by(() => {
    let budget = this.renderLimit;
    let remaining = 0;
    const groups: { id: string; emojis: string[] }[] = [];
    for (const category of this.filteredCategories) {
      const emojis = category.emojis.slice(0, budget);
      budget -= emojis.length;
      remaining += category.emojis.length - emojis.length;
      if (emojis.length > 0) groups.push({ id: category.id, emojis });
    }
    return { groups, remaining };
  });

  constructor(
    readonly root: EmojiPickerRootState,
    readonly opts: EmojiPickerListProps
  ) {
    this.select = this.select.bind(this);
    watch([() => this.search, () => this.allowedEmojis], () => {
      this.renderLimit = RENDER_PAGE_SIZE;
    });
  }

  matches(name: string, search: string, allowedEmojis: Set<string> | null) {
    const emoji = emojiData.emojis[name];
    if (!emoji || (allowedEmojis && !allowedEmojis.has(emoji.skins[0].native))) return false;
    return emojiKeywords[name].some((keyword) => keyword.includes(search));
  }

  async showMore(list: HTMLElement) {
    if (this.loadingMore) {
      this.queuedMore = true;
      return;
    }
    this.loadingMore = true;

    const scrollTop = list.scrollTop;
    const command = this.root.command;
    const selectedIndex = command?.getValidItems().findIndex((item) => item.hasAttribute("data-selected")) ?? -1;
    const categories = this.filteredCategories;
    try {
      this.renderLimit += RENDER_PAGE_SIZE;
      // Let Bits UI finish registering and selecting items before restoring the highlight.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (!list.isConnected || command !== this.root.command || categories !== this.filteredCategories) return;
      if (selectedIndex >= 0) command?.updateSelectedToIndex(selectedIndex);
      await tick();
      list.scrollTop = scrollTop;
    } finally {
      this.loadingMore = false;
      if (this.queuedMore) {
        this.queuedMore = false;
        await tick();
        if (list.isConnected && this.visibleGroups.remaining > 0) void this.showMore(list);
      }
    }
  }

  get skinIndex() {
    return this.root.opts.skin.current;
  }

  select(emoji: string) {
    this.root.select(emoji);
  }

  get maxRecents() {
    if (this.root.opts.showRecents) {
      return this.root.opts.maxRecents.current;
    }

    return 0;
  }

  get showRecents() {
    return this.root.opts.showRecents.current && this.root.frecency !== null;
  }
}

type EmojiPickerInputProps = WritableBoxedValues<{
  value: string;
}>;

class EmojiPickerInputState {
  constructor(
    readonly root: EmojiPickerRootState,
    readonly opts: EmojiPickerInputProps
  ) {
    watch(
      () => this.opts.value.current,
      () => {
        this.root.emojiPickerState.search = this.opts.value.current;
      }
    );
  }
}

class EmojiPickerFooterState {
  constructor(readonly root: EmojiPickerRootState) {}
}

type EmojiPickerSkinProps = ReadableBoxedValues<{
  previewEmoji: string;
}>;

class EmojiPickerSkinToneSelectorState {
  constructor(
    readonly root: EmojiPickerRootState,
    readonly opts: EmojiPickerSkinProps
  ) {
    this.cycleSkinTone = this.cycleSkinTone.bind(this);
  }

  previewEmoji = $derived.by(() => {
    for (const emoji of Object.entries(emojiData.emojis)) {
      const [_, data] = emoji;

      let found = false;
      for (const skin of data.skins) {
        if (skin.native === this.opts.previewEmoji.current) {
          found = true;
          break;
        }
      }

      if (!found) continue;

      if (data.skins.length === 0) {
        throw new Error(`The selected previewEmoji: ${this.opts.previewEmoji.current} does not have multiple skins!`);
      }

      return data;
    }

    return null;
  });

  get preview() {
    if (!this.previewEmoji) return null;

    return this.previewEmoji.skins[this.root.opts.skin.current].native;
  }

  cycleSkinTone() {
    if (!this.previewEmoji) return;

    if (this.root.opts.skin.current + 1 > 5) {
      this.root.opts.skin.current = 0;
    } else {
      this.root.opts.skin.current += 1;
    }

    this.root.opts.onSkinChange.current(this.root.opts.skin.current as EmojiPickerSkin);
  }
}

const ctx = new Context<EmojiPickerRootState>("emoji-picker-root-state");

export function useEmojiPicker(props: EmojiPickerRootProps) {
  return ctx.set(new EmojiPickerRootState(props));
}

export function useEmojiPickerList(props: EmojiPickerListProps) {
  return new EmojiPickerListState(ctx.get(), props);
}

export function useEmojiPickerInput(props: EmojiPickerInputProps) {
  return new EmojiPickerInputState(ctx.get(), props);
}

export function useEmojiPickerFooter() {
  return new EmojiPickerFooterState(ctx.get());
}

export function useEmojiPickerSkinToneSelector(props: EmojiPickerSkinProps) {
  return new EmojiPickerSkinToneSelectorState(ctx.get(), props);
}
