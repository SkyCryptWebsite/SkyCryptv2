import EmojiPickerTest from "$src/test-utils/EmojiPickerTest.svelte";
import data, { type EmojiMartData } from "@emoji-mart/data";
import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";

const emojiData = data as EmojiMartData;
const names = emojiData.categories.flatMap((category) => category.emojis);
const optionNames = () =>
  Array.from(document.querySelectorAll('[role="option"]'), (item) => item.getAttribute("data-value"));

beforeEach(async () => {
  localStorage.removeItem("emoji-picker-performance-test");
  await page.viewport(1024, 768);
});

it("mounts one page and makes every category reachable by scrolling", async () => {
  await render(EmojiPickerTest);
  await expect.poll(() => optionNames().length).toBe(120);
  await page.getByRole("combobox", { name: "Search emojis" }).click();
  const list = document.querySelector<HTMLElement>('[data-slot="command-list"]')!;
  for (let count = 120; count < names.length; count += 120) {
    list.scrollTop = list.scrollHeight;
    const scrollTop = list.scrollTop;
    await expect.poll(() => optionNames().length).toBe(Math.min(count + 120, names.length));
    await expect.poll(() => list.scrollTop).toBe(scrollTop);
  }
  expect(optionNames()).toEqual(names);
});

it("preserves trimmed, case-insensitive substring search and resets the render budget", async () => {
  await render(EmojiPickerTest);
  const list = document.querySelector<HTMLElement>('[data-slot="command-list"]')!;
  list.scrollTop = list.scrollHeight;
  await expect.poll(() => optionNames().length).toBe(240);
  const search = page.getByRole("combobox", { name: "Search emojis" });
  await search.fill("  UCK  ");
  const expected = names.filter((name) => {
    const emoji = emojiData.emojis[name];
    return [emoji.id, emoji.name, ...emoji.keywords].some((keyword) => keyword.toLowerCase().includes("uck"));
  });
  await expect.poll(optionNames).toEqual(expected);
  await search.fill("no-emoji-matches-this-query");
  await expect.element(page.getByText("No results.")).toBeVisible();
  await search.fill("");
  await expect.poll(() => optionNames().length).toBe(120);
});

it("reacts to allowed emoji changes and restricts search and recents", async () => {
  localStorage.setItem(
    "emoji-picker-performance-test",
    JSON.stringify({ "duck:0": { uses: 1, lastUsage: 1 }, "purple_heart:0": { uses: 2, lastUsage: 2 } })
  );
  const view = await render(EmojiPickerTest, { showRecents: true, allowedEmojis: ["💜"] });
  await expect.poll(optionNames).toEqual(["purple_heart:0:recent", "purple_heart"]);
  const search = page.getByRole("combobox", { name: "Search emojis" });
  await search.fill("duck");
  await expect.element(page.getByText("No results.")).toBeVisible();
  await view.rerender({ allowedEmojis: ["🦆"] });
  await expect.poll(optionNames).toEqual(["duck:0:recent", "duck"]);
  await search.fill("");
  await view.rerender({ allowedEmojis: [] });
  await expect.poll(optionNames).toEqual([]);
});

it("selects with the keyboard and preserves skin tones in recents", async () => {
  const onSelect = vi.fn();
  await render(EmojiPickerTest, { showRecents: true, onSelect });
  await page.getByRole("button", { name: "Change skin tone" }).click();
  const search = page.getByRole("combobox", { name: "Search emojis" });
  await search.fill("wave");
  await expect.element(page.getByRole("option", { name: "Waving Hand", exact: true })).toHaveTextContent("👋🏻");
  await userEvent.keyboard("{Home}{Enter}");
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ emoji: "👋🏻", skin: 1 }));
  await expect.poll(() => optionNames()[0]).toBe("wave:1:recent");
  await page.getByRole("option", { name: "Waving Hand", exact: true }).first().click();
  expect(onSelect).toHaveBeenCalledTimes(2);
  expect(onSelect.mock.calls[1][0].skin).toBe(1);
});

it("loads the next page when keyboard navigation reaches the rendered boundary", async () => {
  const onSelect = vi.fn();
  await render(EmojiPickerTest, { onSelect });
  await page.getByRole("combobox", { name: "Search emojis" }).click();
  await userEvent.keyboard("{End}");
  await expect.poll(() => optionNames().length).toBe(240);
  await userEvent.keyboard("{ArrowDown}{Enter}");
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ data: emojiData.emojis[names[125]] }));
});

it("preselects an emoji and fills the footer each time the picker opens", async () => {
  const onSelect = vi.fn();
  await render(EmojiPickerTest, { inPopover: true, allowedEmojis: ["🦆", "💜"], onSelect });
  const trigger = page.getByRole("button", { name: "Open picker" });
  await trigger.click();
  await expect.element(page.getByLabelText("Emoji preview")).toHaveTextContent("💜 Purple Heart");
  expect(document.querySelector('[role="option"][data-selected]')?.getAttribute("data-value")).toBe("purple_heart");
  expect(onSelect).not.toHaveBeenCalled();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("combobox", { name: "Search emojis" })).not.toBeInTheDocument();
  await trigger.click();
  await expect.element(page.getByLabelText("Emoji preview")).toHaveTextContent("💜 Purple Heart");
  expect(document.querySelector('[role="option"][data-selected]')?.getAttribute("data-value")).toBe("purple_heart");
  expect(onSelect).not.toHaveBeenCalled();
});
