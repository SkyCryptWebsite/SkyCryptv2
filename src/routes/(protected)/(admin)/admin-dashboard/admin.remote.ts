import { query } from "$app/server";
import { count, desc, eq, sql } from "drizzle-orm";
import { requireStaff } from "#lib/server/admin";
import { db } from "#lib/server/db";
import { adminAuditLog, apikey, apiKeyRequest, rateLimitRequest, user } from "#lib/server/db/schema";
import { can, primaryRole } from "#lib/shared/roles";

/** What the signed-in staff member may do. The UI hides controls with it; the server checks again. */
export const getStaffContext = query(async () => {
  const { staff } = await requireStaff();
  const { role } = staff;
  return {
    user: { id: staff.id, name: staff.name, image: staff.image, role: primaryRole(role) },
    permissions: {
      reviewRequests: can(role, { apiAccess: ["review"] }),
      manageKeys: can(role, { apiKey: ["manage"] }),
      revokeSessions: can(role, { session: ["revoke"] }),
      banUsers: can(role, { user: ["ban"] }),
      editUsers: can(role, { user: ["update"] }),
      setRoles: can(role, { user: ["set-role"] }),
      viewAuditLog: can(role, { auditLog: ["list"] }),
      manageContent: can(role, { content: ["manage"] })
    }
  };
});

export const getOverview = query(async () => {
  const { staff } = await requireStaff();
  const pending = sql`count(*) filter (where ${apiKeyRequest.status} = 'pending')`.mapWith(Number);
  const [[users], [requests], [rateLimits], [keys], recent] = await Promise.all([
    db
      .select({
        total: count(),
        banned: sql`count(*) filter (where ${user.banned})`.mapWith(Number),
        staff: sql`count(*) filter (where ${user.role} is not null and ${user.role} <> 'user')`.mapWith(Number)
      })
      .from(user),
    db.select({ pending }).from(apiKeyRequest),
    db.select({ pending: count() }).from(rateLimitRequest).where(eq(rateLimitRequest.status, "pending")),
    db.select({ active: sql`count(*) filter (where ${apikey.enabled})`.mapWith(Number), total: count() }).from(apikey),
    can(staff.role, { auditLog: ["list"] })
      ? db
          .select({
            id: adminAuditLog.id,
            action: adminAuditLog.action,
            createdAt: adminAuditLog.createdAt,
            actorName: sql<
              string | null
            >`(select ${user.name} from ${user} where ${user.id} = ${adminAuditLog.actorId})`,
            targetName: sql<
              string | null
            >`(select ${user.name} from ${user} where ${user.id} = ${adminAuditLog.targetUserId})`
          })
          .from(adminAuditLog)
          .orderBy(desc(adminAuditLog.createdAt))
          .limit(6)
      : Promise.resolve(null)
  ]);
  return { users, pendingApiRequests: requests.pending, pendingRateLimits: rateLimits.pending, keys, recent };
});
