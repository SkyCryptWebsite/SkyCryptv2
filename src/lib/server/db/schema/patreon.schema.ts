import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const patreonMembership = pgTable(
  "patreon_membership",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    patreonUserId: text("patreon_user_id").notNull(),
    memberId: text("member_id").notNull(),
    campaignId: text("campaign_id").notNull(),
    lifetimeSupportCents: integer("lifetime_support_cents").default(0).notNull(),
    currentlyEntitledAmountCents: integer("currently_entitled_amount_cents").default(0).notNull(),
    patronStatus: text("patron_status"),
    entitlementLevel: integer("entitlement_level").default(0).notNull(),
    verifiedAt: timestamp("verified_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [
    uniqueIndex("patreon_membership_userId_uidx").on(table.userId),
    uniqueIndex("patreon_membership_memberId_uidx").on(table.memberId),
    index("patreon_membership_patreonUserId_idx").on(table.patreonUserId)
  ]
);

export const patreonCreatorToken = pgTable("patreon_creator_token", {
  campaignId: text("campaign_id").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
