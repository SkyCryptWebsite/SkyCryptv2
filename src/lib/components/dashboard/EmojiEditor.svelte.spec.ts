import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import EmojiEditor from "./EmojiEditor.svelte";
import "../../../routes/layout.css";

const mocks = vi.hoisted(() => ({ updateEmoji: vi.fn() }));
vi.mock("$routes/(protected)/dashboard/donator-perks/perks.remote", () => ({ updateEmoji: mocks.updateEmoji }));
vi.mock("svelte-sonner", () => ({ toast: { success: vi.fn() } }));

const account = { uuid: "4855c53ee4fb4100997600a92fc50984", username: "EmojiTest", emoji: "❤️", entitlementLevel: 1 };
beforeEach(() => vi.resetAllMocks());

it("lets heart supporters preview and save a different heart", async () => {
  await page.viewport(320, 844);
  const view = await render(EmojiEditor, { account });
  await expect.element(page.getByRole("button", { name: "Save emoji" })).toBeDisabled();
  await expect.element(page.getByRole("combobox", { name: "Search emojis" })).toBeVisible();
  expect(page.getByRole("option").all().length).toBe(12);
  const options = document.querySelectorAll('[role="option"]');
  expect(options[0].getBoundingClientRect().right).toBeLessThanOrEqual(options[1].getBoundingClientRect().left);
  await expect.element(page.getByRole("button", { name: "Choose any emoji", exact: true })).not.toBeInTheDocument();
  await page.getByRole("option", { name: "Purple Heart", exact: true }).click();
  await expect.element(page.getByText("Save to apply your preview")).not.toBeInTheDocument();
  await expect.element(page.getByLabelText("Selected emoji", { exact: true })).toHaveTextContent("💜");
  await page.getByRole("button", { name: "Save emoji" }).click();
  expect(mocks.updateEmoji).toHaveBeenCalledWith({ uuid: account.uuid, emoji: "💜" });
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  await view.unmount();
});

it("searches the picker, previews an emoji, and retains it after a save failure", async () => {
  const view = await render(EmojiEditor, { account: { ...account, entitlementLevel: 2 } });
  const search = page.getByRole("combobox", { name: "Search emojis" });
  await search.fill("duck");
  await page.getByRole("option", { name: "Duck", exact: true }).click();
  await expect.element(page.getByLabelText("Selected emoji", { exact: true })).toHaveTextContent("🦆");
  await expect.element(search).toBeVisible();
  mocks.updateEmoji.mockRejectedValueOnce(new Error("Please try again."));
  await page.getByRole("button", { name: "Save emoji" }).click();
  await expect.element(page.getByRole("alert")).toHaveTextContent("Please try again.");
  await expect.element(page.getByLabelText("Selected emoji", { exact: true })).toHaveTextContent("🦆");
  await page.getByRole("button", { name: "Save emoji" }).click();
  expect(mocks.updateEmoji).toHaveBeenLastCalledWith({ uuid: account.uuid, emoji: "🦆" });
  await view.unmount();
});

it("shows the locked state without edit controls", async () => {
  const view = await render(EmojiEditor, { account: { ...account, emoji: null, entitlementLevel: 0 } });
  await expect.element(page.getByRole("button", { name: "Save emoji" })).not.toBeInTheDocument();
  await expect.element(page.getByText("Unlock a colored heart at $5 total support")).toBeVisible();
  await view.unmount();
});

it("applies skin tones and supports keyboard selection in the picker", async () => {
  const view = await render(EmojiEditor, { account: { ...account, entitlementLevel: 2 } });
  await page.getByRole("button", { name: "Change skin tone" }).click();
  const search = page.getByRole("combobox", { name: "Search emojis" });
  await search.fill("wave");
  await search.click();
  await page.getByRole("option", { name: "Waving Hand", exact: true }).click();
  await expect.element(page.getByLabelText("Selected emoji", { exact: true })).toHaveTextContent("👋🏻");
  await page.getByRole("combobox", { name: "Search emojis" }).fill("duck");
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect.element(page.getByLabelText("Selected emoji", { exact: true })).toHaveTextContent("🦆");
  await view.unmount();
});

it("only offers colored hearts to heart supporters, including when searching", async () => {
  const view = await render(EmojiEditor, { account });
  const search = page.getByRole("combobox", { name: "Search emojis" });
  await search.fill("duck");
  await expect.element(page.getByText("No results.")).toBeVisible();
  await expect.element(page.getByRole("option", { name: "Duck", exact: true })).not.toBeInTheDocument();
  await search.fill("blue");
  await page.getByRole("option", { name: "Blue Heart", exact: true }).click();
  await expect.element(page.getByLabelText("Selected emoji", { exact: true })).toHaveTextContent("💙");
  await view.unmount();
});

it("preselects an emoji for the footer when opening and reopening the popover", async () => {
  await render(EmojiEditor, { account: { ...account, entitlementLevel: 2 } });
  const trigger = page.getByRole("button", { name: "Edit profile emoji" });
  await trigger.click();
  await expect.element(page.getByText("Grinning Face", { exact: true })).toBeVisible();
  const firstOption = document.querySelector('[role="option"][data-selected]');
  expect(firstOption?.getAttribute("aria-label")).toBe("Grinning Face");
  expect(mocks.updateEmoji).not.toHaveBeenCalled();
  await page.getByRole("combobox", { name: "Search emojis" }).fill("duck");
  await expect.element(page.getByText("Duck", { exact: true })).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("combobox", { name: "Search emojis" })).not.toBeInTheDocument();
  await trigger.click();
  await expect.element(page.getByText("Grinning Face", { exact: true })).toBeVisible();
  expect(mocks.updateEmoji).not.toHaveBeenCalled();
});
