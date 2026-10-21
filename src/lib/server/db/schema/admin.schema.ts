import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { AuditAction } from "#lib/shared/admin";
import { user } from "./auth.schema";

export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: text("id").primaryKey(),
    // Kept when either account is deleted, so the history of decisions survives.
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").$type<AuditAction>().notNull(),
    targetUserId: text("target_user_id").references(() => user.id, { onDelete: "set null" }),
    // The request or key the action applied to, when it wasn't the user itself.
    targetId: text("target_id"),
    note: text("note"),
    details: jsonb("details").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [
    index("admin_audit_log_createdAt_idx").on(table.createdAt),
    index("admin_audit_log_actorId_idx").on(table.actorId),
    index("admin_audit_log_targetUserId_idx").on(table.targetUserId)
  ]
);
