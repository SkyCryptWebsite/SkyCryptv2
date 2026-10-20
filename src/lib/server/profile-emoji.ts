import { error } from "@sveltejs/kit";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "#lib/server/db";
import { account, minecraftAccount, patreonMembership, profileEmoji } from "#lib/server/db/schema";
import { canSelectEmoji, profileEmojiSchema, profileUuidSchema } from "#lib/shared/profile-emoji";

export async function getEmojiAccounts(userId: string) {
  return db
    .selectDistinct({
      uuid: minecraftAccount.uuid,
      username: minecraftAccount.username,
      primary: minecraftAccount.primary,
      emoji: profileEmoji.emoji,
      entitlementLevel: sql<number>`greatest(coalesce(${profileEmoji.entitlementLevel}, 0), coalesce(${patreonMembership.entitlementLevel}, 0))`
    })
    .from(minecraftAccount)
    .innerJoin(account, eq(minecraftAccount.accountId, account.id))
    .leftJoin(profileEmoji, eq(profileEmoji.uuid, minecraftAccount.uuid))
    .leftJoin(patreonMembership, eq(patreonMembership.userId, account.userId))
    .where(and(eq(account.userId, userId), eq(account.providerId, "mc-id")))
    .orderBy(desc(minecraftAccount.primary), asc(minecraftAccount.username));
}

export async function saveProfileEmoji(userId: string, uuid: string, emoji: string) {
  const parsedUuid = profileUuidSchema.safeParse(uuid);
  const parsedEmoji = profileEmojiSchema.safeParse(emoji);
  if (!parsedUuid.success || !parsedEmoji.success) error(400, "Choose a valid Minecraft account and a single emoji.");
  uuid = parsedUuid.data;
  emoji = parsedEmoji.data;

  await db.transaction(async (tx) => {
    // Lock the verified link so unlinking/syncing cannot race this ownership check.
    const [owner] = await tx
      .select({ id: account.id })
      .from(account)
      .innerJoin(minecraftAccount, eq(minecraftAccount.accountId, account.id))
      .where(and(eq(account.userId, userId), eq(account.providerId, "mc-id"), eq(minecraftAccount.uuid, uuid)))
      .for("update", { of: account });
    if (!owner) error(403, "Link this Minecraft account through MC-ID before changing its emoji.");

    const [grant] = await tx.select().from(profileEmoji).where(eq(profileEmoji.uuid, uuid));
    const [membership] = await tx.select().from(patreonMembership).where(eq(patreonMembership.userId, userId));
    const level = Math.max(grant?.entitlementLevel ?? 0, membership?.entitlementLevel ?? 0);
    if (!canSelectEmoji(level, emoji)) error(403, "This account has not unlocked that emoji.");

    await tx
      .insert(profileEmoji)
      .values({ uuid, emoji, entitlementLevel: level })
      .onConflictDoUpdate({
        target: profileEmoji.uuid,
        set: {
          emoji,
          entitlementLevel: sql`greatest(${profileEmoji.entitlementLevel}, ${level})`,
          updatedAt: new Date()
        }
      });
  });
}
