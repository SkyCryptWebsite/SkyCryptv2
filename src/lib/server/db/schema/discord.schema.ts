import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const discordProfile = pgTable("discord_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  discordUserId: text("discord_user_id").notNull().unique(),
  username: text("username"),
  primaryGuild: jsonb("primary_guild").$type<{
    identity_guild_id: string | null;
    identity_enabled: boolean | null;
    tag: string | null;
    badge: string | null;
  }>(),
  avatarHash: text("avatar_hash"),
  bannerHash: text("banner_hash"),
  avatarDecorationHash: text("avatar_decoration_hash"),
  syncedAt: timestamp("synced_at").defaultNow().notNull()
});
