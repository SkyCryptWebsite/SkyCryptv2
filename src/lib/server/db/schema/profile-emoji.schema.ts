import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// UUID grants also cover donations outside Patreon and manually granted perks.
export const profileEmoji = pgTable(
  "profile_emoji",
  {
    uuid: text("uuid").primaryKey(),
    emoji: text("emoji").notNull(),
    entitlementLevel: integer("entitlement_level").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  (table) => [check("profile_emoji_entitlement_check", sql`${table.entitlementLevel} between 1 and 2`)]
);
