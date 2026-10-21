import type { PublicProfile } from "$types";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "#lib/server/db";
import { account, discordProfile, minecraftAccount, user } from "#lib/server/db/schema";

const discordAvatar = (discordUserId: string, hash: string) =>
  `https://cdn.discordapp.com/avatars/${discordUserId}/${hash}.webp?size=128&animated=true`;

/** Public profiles by user ID; users that no longer exist are left out. */
export async function getPublicProfiles(userIds: (string | null)[]) {
  const ids = [...new Set(userIds.filter((id): id is string => !!id))];
  const profiles = new Map<string, PublicProfile>();
  if (!ids.length) return profiles;

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      discordUserId: discordProfile.discordUserId,
      discordUsername: discordProfile.username,
      avatarHash: discordProfile.avatarHash,
      mcUuid: minecraftAccount.uuid,
      mcUsername: minecraftAccount.username
    })
    .from(user)
    .leftJoin(discordProfile, eq(discordProfile.userId, user.id))
    .leftJoin(account, and(eq(account.userId, user.id), eq(account.providerId, "mc-id")))
    .leftJoin(minecraftAccount, eq(minecraftAccount.accountId, account.id))
    .where(inArray(user.id, ids))
    // The primary Minecraft account comes first, so it wins below.
    .orderBy(desc(minecraftAccount.primary));

  for (const row of rows) {
    if (profiles.has(row.id)) continue;
    profiles.set(row.id, {
      id: row.id,
      name: row.name,
      avatarUrl: row.discordUserId && row.avatarHash ? discordAvatar(row.discordUserId, row.avatarHash) : row.image,
      discordUsername: row.discordUsername,
      minecraft: row.mcUuid && row.mcUsername ? { uuid: row.mcUuid, username: row.mcUsername } : null
    });
  }
  return profiles;
}
