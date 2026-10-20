import { query } from "$app/server";
import { eq } from "drizzle-orm";
import { db } from "#lib/server/db";
import { profileEmoji } from "#lib/server/db/schema";
import { canSelectEmoji, profileEmojiSchema, profileUuidSchema } from "#lib/shared/profile-emoji";

export const getProfileEmoji = query(profileUuidSchema, async (uuid) => {
  const [profile] = await db
    .select({ emoji: profileEmoji.emoji, entitlementLevel: profileEmoji.entitlementLevel })
    .from(profileEmoji)
    .where(eq(profileEmoji.uuid, uuid));
  if (!profile) return null;
  const emoji = profileEmojiSchema.safeParse(profile.emoji);
  return emoji.success && canSelectEmoji(profile.entitlementLevel, emoji.data) ? emoji.data : null;
});
