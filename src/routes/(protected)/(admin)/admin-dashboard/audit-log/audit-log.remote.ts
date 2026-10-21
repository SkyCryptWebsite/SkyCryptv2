import { query } from "$app/server";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { requireStaff } from "#lib/server/admin";
import { db } from "#lib/server/db";
import { adminAuditLog, user } from "#lib/server/db/schema";
import { AUDIT_ACTIONS, listArgs, type AuditAction } from "#lib/shared/admin";

const actor = alias(user, "actor");
const target = alias(user, "target");

export const listAuditLog = query(
  listArgs.extend({
    action: z.enum(["all", ...(Object.keys(AUDIT_ACTIONS) as AuditAction[])]).default("all")
  }),
  async ({ page, size, q, action }) => {
    await requireStaff({ auditLog: ["list"] });
    const filters: (SQL | undefined)[] = [
      action === "all" ? undefined : eq(adminAuditLog.action, action),
      q ? or(ilike(actor.name, `%${q}%`), ilike(target.name, `%${q}%`), ilike(adminAuditLog.note, `%${q}%`)) : undefined
    ];
    const where = and(...filters);
    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: adminAuditLog.id,
          action: adminAuditLog.action,
          note: adminAuditLog.note,
          details: adminAuditLog.details,
          targetId: adminAuditLog.targetId,
          createdAt: adminAuditLog.createdAt,
          actor: { id: actor.id, name: actor.name, image: actor.image },
          target: { id: target.id, name: target.name }
        })
        .from(adminAuditLog)
        .leftJoin(actor, eq(actor.id, adminAuditLog.actorId))
        .leftJoin(target, eq(target.id, adminAuditLog.targetUserId))
        .where(where)
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(size)
        .offset((page - 1) * size),
      db
        .select({ total: count() })
        .from(adminAuditLog)
        .leftJoin(actor, eq(actor.id, adminAuditLog.actorId))
        .leftJoin(target, eq(target.id, adminAuditLog.targetUserId))
        .where(where)
    ]);
    return { total, rows };
  }
);
