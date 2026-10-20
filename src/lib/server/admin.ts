import { getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { auth } from "#lib/server/auth";
import { db } from "#lib/server/db";
import { adminAuditLog, user } from "#lib/server/db/schema";
import type { AuditAction } from "#lib/shared/admin";
import { can, roleRank, type Permissions } from "#lib/shared/roles";

/**
 * Loads a fresh session (bypassing the 5 minute cookie cache, so demotions apply immediately) and requires dashboard
 * access plus the given permissions.
 */
export async function requireStaff(permissions?: Permissions) {
  const { request } = getRequestEvent();
  const session = await auth.api.getSession({ headers: request.headers, query: { disableCookieCache: true } });
  if (!session) error(401, "Sign in to use the admin dashboard.");
  const { role } = session.user;
  if (!can(role, { dashboard: ["view"] })) error(403, "You don’t have access to the admin dashboard.");
  if (permissions && !can(role, permissions)) error(403, "Your role doesn’t allow this action.");
  return { staff: session.user, headers: request.headers };
}

/** Staff may only act on users of a lower rank, and never on themselves. */
export async function requireOutranks(staff: { id: string; role?: string | null }, targetUserId: string) {
  if (staff.id === targetUserId) error(403, "You can’t do this to your own account.");
  const [target] = await db.select({ role: user.role }).from(user).where(eq(user.id, targetUserId));
  if (!target) error(404, "User not found.");
  if (roleRank(target.role) >= roleRank(staff.role)) error(403, "You can only act on users below your rank.");
  return target;
}

type Executor = Pick<typeof db, "insert">;

export async function audit(
  executor: Executor,
  entry: {
    actorId: string;
    action: AuditAction;
    targetUserId?: string | null;
    targetId?: string | null;
    note?: string | null;
    details?: Record<string, unknown>;
  }
) {
  await executor.insert(adminAuditLog).values({ id: crypto.randomUUID(), ...entry, note: entry.note || null });
  getRequestEvent().locals.log.set({ admin: { action: entry.action, targetUserId: entry.targetUserId } });
}
