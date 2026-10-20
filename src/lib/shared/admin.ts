import { z } from "zod";
import { STAFF_ROLES } from "#lib/shared/roles";

export const AUDIT_ACTIONS = {
  "api_request.approve": "Approved API access",
  "api_request.deny": "Denied API access",
  "rate_limit.approve": "Approved rate limit",
  "rate_limit.deny": "Denied rate limit",
  "api_key.disable": "Disabled API key",
  "api_key.enable": "Enabled API key",
  "api_key.rate_limit": "Set rate limit",
  "api_key.update": "Updated API key",
  "api_key.delete": "Deleted API key",
  "user.ban": "Banned user",
  "user.unban": "Unbanned user",
  "user.revoke_sessions": "Signed user out",
  "user.set_role": "Changed role",
  "user.update": "Updated user",
  "user.ban_evasion": "Banned for ban evasion",
  "post.create": "Created post",
  "post.publish": "Published post",
  "post.unpublish": "Unpublished post",
  "post.delete": "Deleted post",
  "banner.create": "Created banner",
  "banner.update": "Updated banner",
  "banner.delete": "Deleted banner"
} as const;

export type AuditAction = keyof typeof AUDIT_ACTIONS;

export const PAGE_SIZES = [10, 25, 50, 100] as const;

/** Shared list arguments; pages are 1-based to match the URL. */
export const listArgs = z.object({
  page: z.number().int().min(1).default(1),
  size: z
    .number()
    .int()
    .refine((size) => (PAGE_SIZES as readonly number[]).includes(size))
    .default(25),
  q: z.string().trim().max(100).default("")
});

export const reviewNote = z.string().trim().max(1000, "Keep the note under 1000 characters.").default("");

export const reviewSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["approve", "deny"]),
  note: reviewNote
});

export const USER_FILTERS = ["all", "staff", "banned", ...STAFF_ROLES] as const;

export const BAN_DURATIONS = {
  "1d": { label: "1 day", seconds: 86_400 },
  "7d": { label: "7 days", seconds: 7 * 86_400 },
  "30d": { label: "30 days", seconds: 30 * 86_400 },
  permanent: { label: "Permanent", seconds: null }
} as const;
