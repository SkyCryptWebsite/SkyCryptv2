import { z } from "zod";

export const coloredHearts = ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "🩷", "🩵", "🩶"];

export const profileUuidSchema = z.string().regex(/^[a-f0-9]{32}$/);
export const profileEmojiSchema = z
  .string()
  .trim()
  .max(32)
  .transform((emoji) => (emoji === "❤" ? "❤️" : emoji))
  .refine(
    (emoji) => /^(?!\p{Emoji_Component}\uFE0F?$)(?:\p{RGI_Emoji}|\p{Extended_Pictographic}\uFE0F?)$/v.test(emoji),
    "Choose a single emoji."
  );

export function canSelectEmoji(level: number, emoji: string) {
  return level === 2 || (level === 1 && coloredHearts.includes(emoji));
}
