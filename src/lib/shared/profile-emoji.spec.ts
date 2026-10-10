import { expect, it } from "vitest";
import { canSelectEmoji, coloredHearts, profileEmojiSchema } from "./profile-emoji";

it.each(["❤️", "❤", "🦆", "🇨🇿", "👩🏽‍💻", "👨‍👩‍👧‍👦", "1️⃣", "🏳️‍🌈", "👍🏽", "☀"])("accepts one emoji: %s", (emoji) => {
  expect(profileEmojiSchema.safeParse(emoji).success).toBe(true);
});

it.each(["", "hello", "ab", "1", "#", "🦆🦆", "❤️hello", "🇨", "🏽", "🦆\u200b", "🦆\n🔥"])(
  "rejects non-emoji input: %s",
  (emoji) => {
    expect(profileEmojiSchema.safeParse(emoji).success).toBe(false);
  }
);

it("normalizes the legacy heart and enforces permission levels", () => {
  expect(profileEmojiSchema.parse(" ❤ ")).toBe("❤️");
  expect(coloredHearts.every((heart) => canSelectEmoji(1, heart))).toBe(true);
  expect(canSelectEmoji(0, "❤️")).toBe(false);
  expect(canSelectEmoji(1, "🦆")).toBe(false);
  expect(canSelectEmoji(2, "🦆")).toBe(true);
});

it.each([-1, 0.5, 1.5, 3, Infinity, NaN])("rejects unsupported entitlement level %s", (level) => {
  expect(canSelectEmoji(level, "❤️")).toBe(false);
  expect(canSelectEmoji(level, "🦆")).toBe(false);
});
