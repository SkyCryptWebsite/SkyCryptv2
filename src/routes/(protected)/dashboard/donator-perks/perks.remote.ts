import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { z } from "zod";
import { getEmojiAccounts, saveProfileEmoji } from "#lib/server/profile-emoji";
import { profileEmojiSchema, profileUuidSchema } from "#lib/shared/profile-emoji";
import { getProfileEmoji } from "#lib/shared/profile-emoji.remote";

export const getPerks = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, "Sign in to view your emoji perks.");
  return getEmojiAccounts(locals.user.id);
});

export const updateEmoji = command(
  z.object({ uuid: profileUuidSchema, emoji: profileEmojiSchema }),
  async ({ uuid, emoji }) => {
    const { locals } = getRequestEvent();
    if (!locals.user) error(401, "Sign in to change your emoji.");
    await saveProfileEmoji(locals.user.id, uuid, emoji);
    await Promise.all([getPerks().refresh(), getProfileEmoji(uuid).refresh()]);
  }
);
