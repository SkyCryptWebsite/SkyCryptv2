import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

export enum UserRole {
  User = "user",
  TrialModerator = "trial-moderator",
  Moderator = "moderator",
  HeadModerator = "head-moderator",
  Admin = "admin"
}

/** Staff roles from lowest to highest rank. Staff can never act on someone of equal or higher rank. */
export const STAFF_ROLES = [
  UserRole.TrialModerator,
  UserRole.Moderator,
  UserRole.HeadModerator,
  UserRole.Admin
] as const;

export const roleLabels: Record<UserRole, string> = {
  [UserRole.User]: "User",
  [UserRole.TrialModerator]: "Trial moderator",
  [UserRole.Moderator]: "Moderator",
  [UserRole.HeadModerator]: "Head moderator",
  [UserRole.Admin]: "Admin"
};

export const statement = {
  ...defaultStatements,
  dashboard: ["view"],
  apiAccess: ["review"],
  apiKey: ["manage"],
  auditLog: ["list"],
  content: ["manage"]
} as const;

export const ac = createAccessControl(statement);

const view = { dashboard: ["view"], user: ["list", "get"], session: ["list"] } as const;

// Better Auth's admin endpoints check these too, so impersonation, deletion and password changes stay disabled.
export const roles = {
  [UserRole.User]: ac.newRole({}),
  [UserRole.TrialModerator]: ac.newRole(view),
  [UserRole.Moderator]: ac.newRole({ ...view, session: ["list", "revoke"], apiAccess: ["review"] }),
  [UserRole.HeadModerator]: ac.newRole({
    ...view,
    user: ["list", "get", "ban", "update"],
    session: ["list", "revoke"],
    apiAccess: ["review"],
    apiKey: ["manage"],
    auditLog: ["list"]
  }),
  [UserRole.Admin]: ac.newRole({
    ...view,
    user: ["list", "get", "ban", "update", "set-role"],
    session: ["list", "revoke"],
    apiAccess: ["review"],
    apiKey: ["manage"],
    auditLog: ["list"],
    content: ["manage"]
  })
};

export type Permissions = { [K in keyof typeof statement]?: readonly (typeof statement)[K][number][] };

const parseRoles = (role: string | null | undefined) => (role || UserRole.User).split(",").map((name) => name.trim());

/** Mirrors Better Auth's `hasPermission`: any of the user's comma-separated roles may grant the permissions. */
export function can(role: string | null | undefined, permissions: Permissions) {
  return parseRoles(role).some((name) => roles[name as UserRole]?.authorize(permissions).success === true);
}

/** 0 for regular users, otherwise 1 (trial moderator) to 4 (admin). */
export function roleRank(role: string | null | undefined) {
  return Math.max(0, ...parseRoles(role).map((name) => (STAFF_ROLES as readonly string[]).indexOf(name) + 1));
}

/** The highest-ranked role, for display. */
export function primaryRole(role: string | null | undefined) {
  const rank = roleRank(role);
  return rank ? STAFF_ROLES[rank - 1] : UserRole.User;
}
