import { sql } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { ApiKeyRequestStatus, ApiUseCase, RateLimitRequestStatus } from "#lib/shared/constants/developer";
import { apikey, user } from "./auth.schema";

export const apiKeyRequest = pgTable(
  "api_key_request",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    useCase: text("use_case").$type<ApiUseCase>().notNull(),
    description: text("description").notNull(),
    url: text("url").notNull(),
    // "revoked" closes an approval so the user can request a new key; staff also disable the issued key.
    status: text("status").$type<ApiKeyRequestStatus>().default("pending").notNull(),
    // Shown to the requester, so admins should keep it user-facing.
    reviewNote: text("review_note"),
    reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at"),
    apiKeyId: text("api_key_id").references(() => apikey.id, { onDelete: "set null" }),
    termsAcceptedAt: timestamp("terms_accepted_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [
    // One open (pending or approved) request per user, enforced even under concurrent submissions.
    uniqueIndex("api_key_request_open_uidx")
      .on(table.userId)
      .where(sql`${table.status} in ('pending', 'approved')`),
    index("api_key_request_status_idx").on(table.status)
  ]
);

export const rateLimitRequest = pgTable(
  "rate_limit_request",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Increases belong to one approval; a new access request starts from the default limit.
    apiKeyRequestId: text("api_key_request_id")
      .notNull()
      .references(() => apiKeyRequest.id, { onDelete: "cascade" }),
    // Requests per the key's rate limit window. Once approved, keys generated for the access request use it.
    requestedMax: integer("requested_max").notNull(),
    reason: text("reason").notNull(),
    status: text("status").$type<RateLimitRequestStatus>().default("pending").notNull(),
    // Shown to the requester, so admins should keep it user-facing.
    reviewNote: text("review_note"),
    reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [
    uniqueIndex("rate_limit_request_pending_uidx")
      .on(table.userId)
      .where(sql`${table.status} = 'pending'`),
    index("rate_limit_request_apiKeyRequestId_idx").on(table.apiKeyRequestId),
    index("rate_limit_request_status_idx").on(table.status)
  ]
);
