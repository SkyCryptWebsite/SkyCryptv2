import FileKeyIcon from "@lucide/svelte/icons/file-key";
import GaugeIcon from "@lucide/svelte/icons/gauge";
import KeyRoundIcon from "@lucide/svelte/icons/key-round";
import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
import ScrollTextIcon from "@lucide/svelte/icons/scroll-text";
import UsersIcon from "@lucide/svelte/icons/users";

export const ADMIN_BASE = "/admin-dashboard";

/**
 * Sidebar groups; `pending` names the overview count shown as a badge, `requires` hides the item without the
 * permission.
 */
export const navGroups = [
  { label: null, items: [{ title: "Overview", url: ADMIN_BASE, icon: LayoutDashboardIcon }] },
  {
    label: "API",
    items: [
      { title: "Access requests", url: `${ADMIN_BASE}/api-requests`, icon: FileKeyIcon, pending: "pendingApiRequests" },
      { title: "Rate limits", url: `${ADMIN_BASE}/rate-limits`, icon: GaugeIcon, pending: "pendingRateLimits" },
      { title: "API keys", url: `${ADMIN_BASE}/api-keys`, icon: KeyRoundIcon }
    ]
  },
  { label: "Community", items: [{ title: "Users", url: `${ADMIN_BASE}/users`, icon: UsersIcon }] },
  {
    label: "Staff",
    items: [{ title: "Audit log", url: `${ADMIN_BASE}/audit-log`, icon: ScrollTextIcon, requires: "viewAuditLog" }]
  }
] as const;

export const pageTitles: Record<string, string> = Object.fromEntries(
  navGroups.flatMap(({ items }) => items.map(({ url, title }) => [url, title]))
);
