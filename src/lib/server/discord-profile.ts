import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#lib/server/db";
import { discordProfile } from "#lib/server/db/schema";

const assetHash = z
  .string()
  .regex(/^[a-zA-Z0-9_]+$/)
  .nullish();
const discordAssetSchema = z.object({
  id: z.string().regex(/^\d+$/),
  username: z.string().min(1).nullish(),
  primary_guild: z
    .object({
      identity_guild_id: z.string().regex(/^\d+$/).nullable().default(null),
      identity_enabled: z.boolean().nullable().default(null),
      tag: z.string().nullable().default(null),
      badge: assetHash.transform((value) => value ?? null)
    })
    .nullish(),
  avatar: assetHash,
  banner: assetHash,
  avatar_decoration: assetHash,
  avatar_decoration_data: z.object({ asset: z.string().regex(/^[a-zA-Z0-9_]+$/) }).nullish()
});

export function parseDiscordProfile(profile: unknown) {
  const result = discordAssetSchema.safeParse(profile);
  if (!result.success) return null;
  const data = result.data;
  return {
    discordUserId: data.id,
    username: data.username ?? null,
    primaryGuild: data.primary_guild ?? null,
    avatarHash: data.avatar ?? null,
    bannerHash: data.banner ?? null,
    // Prefer the current Discord field; explicit null means the decoration was removed.
    avatarDecorationHash:
      data.avatar_decoration_data === undefined
        ? (data.avatar_decoration ?? null)
        : (data.avatar_decoration_data?.asset ?? null)
  };
}

export type DiscordProfileAssets = NonNullable<ReturnType<typeof parseDiscordProfile>>;

export async function syncDiscordProfile(userId: string, assets: DiscordProfileAssets) {
  const values = { ...assets, syncedAt: new Date() };
  await db
    .insert(discordProfile)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: discordProfile.userId, set: values });
}

export async function getDiscordProfile(userId: string) {
  const [profile] = await db.select().from(discordProfile).where(eq(discordProfile.userId, userId)).limit(1);
  return profile ?? null;
}
