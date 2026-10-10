import { afterEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import Preview from "../../../test-utils/DashboardPreview.svelte";
import Home from "./+page.svelte";
import Perks from "./donator-perks/+page.svelte";
import Settings from "./settings/+page.svelte";

const route = vi.hoisted(() => ({ url: new URL("http://localhost/dashboard") }));
vi.mock("$app/state", () => ({ page: route }));
afterEach(() => document.documentElement.classList.remove("dark"));
vi.mock("$lib/shared/auth-client", () => ({
  authClient: { linkSocial: vi.fn(), updateUser: vi.fn(), revokeOtherSessions: vi.fn() }
}));
vi.mock("./dashboard.remote", () => ({
  getDashboard: () =>
    Promise.resolve({
      user: { id: "preview", name: "SkyBlock Player", createdAt: new Date("2025-01-01") },
      accounts: [],
      membership: null
    }),
  verifyMembership: Object.assign(vi.fn(), { pending: 0 })
}));
vi.mock("./donator-perks/perks.remote", () => ({
  getPerks: () => Promise.resolve([]),
  updateEmoji: vi.fn()
}));
vi.mock("./settings/settings.remote", () => ({
  deleteAccount: vi.fn(),
  exportData: vi.fn(),
  revokeSession: vi.fn(),
  getSessions: () =>
    Promise.resolve([
      {
        id: "preview",
        current: true,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
        ipAddress: "127.0.0.1",
        createdAt: new Date("2026-01-01"),
        expiresAt: new Date("2026-02-01")
      }
    ])
}));

for (const [name, screen, heading] of [
  ["home", Home, "Welcome, SkyBlock Player"],
  ["settings", Settings, "Settings"],
  ["perks", Perks, "Donator Perks"]
] as const) {
  it(`${name} fits desktop and mobile`, async () => {
    route.url = new URL(
      `http://localhost/dashboard${name === "home" ? "" : name === "perks" ? "/donator-perks" : "/settings"}`
    );
    await page.viewport(1280, 1000);
    document.documentElement.classList.add("dark");
    const view = await render(Preview, { screen });
    await expect.element(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await page.viewport(390, 844);
    await expect.poll(() => document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    if (name === "settings") {
      await page.getByText("Browser details", { exact: true }).click();
      await expect.element(page.getByText("Mozilla/5.0", { exact: false })).toBeVisible();
    }
    await view.unmount();
  });
}
