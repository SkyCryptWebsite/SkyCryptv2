import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import Preview from "../../../../test-utils/DashboardPreview.svelte";
import Settings from "./+page.svelte";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  revoke: vi.fn(),
  revokeOther: vi.fn(),
  exportData: vi.fn(),
  deleteAccount: vi.fn(),
  signOut: vi.fn(),
  getDashboard: vi.fn()
}));
vi.mock("$app/state", () => ({ page: { url: new URL("http://localhost/dashboard/settings") } }));
vi.mock("#lib/shared/auth-client.js", () => ({
  authClient: { revokeOtherSessions: mocks.revokeOther, signOut: mocks.signOut }
}));
vi.mock("../dashboard.remote", () => ({ getDashboard: mocks.getDashboard }));
vi.mock("./settings.remote", () => ({
  getSessions: () =>
    Object.assign(
      Promise.resolve([
        {
          id: "current",
          current: true,
          userAgent: "Mozilla/5.0 (Macintosh) Chrome/130 Safari/537.36",
          ipAddress: "127.0.0.1",
          createdAt: new Date("2026-01-01"),
          expiresAt: new Date("2026-02-01")
        },
        {
          id: "other",
          current: false,
          userAgent: "Mozilla/5.0 (iPhone) Version/18 Safari/604.1",
          ipAddress: "2001:db8::1",
          createdAt: new Date("2026-01-02"),
          expiresAt: new Date("2026-02-02")
        }
      ]),
      { refresh: mocks.refresh }
    ),
  revokeSession: mocks.revoke,
  exportData: mocks.exportData,
  deleteAccount: mocks.deleteAccount
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getDashboard.mockResolvedValue({ user: { name: "SkyBlock Player" } });
});
afterEach(() => document.documentElement.classList.remove("dark"));

it("removes profile editing and handles individual sign-out on mobile", async () => {
  await page.viewport(390, 844);
  await render(Preview, { screen: Settings });
  await expect.element(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expect.element(page.getByRole("textbox", { name: "Display name" })).not.toBeInTheDocument();
  await expect.element(page.getByText("Chrome on macOS", { exact: false })).toBeVisible();
  await expect.element(page.getByText("Safari on iPhone", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sign out of Safari on iPhone" }).click();
  expect(mocks.revoke).toHaveBeenCalledWith("other");
  expect(mocks.refresh).toHaveBeenCalled();
  await expect.poll(() => document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
});
it("requires typed confirmation, keeps deletion errors visible, and supports cancellation", async () => {
  mocks.deleteAccount.mockRejectedValue(new Error("Sign in again before deleting your account."));
  await render(Preview, { screen: Settings });
  await page.getByRole("button", { name: "Delete account", exact: true }).click();
  const confirm = page.getByRole("button", { name: "Permanently delete account" });
  await expect.element(confirm).toBeDisabled();
  await page.getByRole("textbox", { name: "Type DELETE to confirm" }).fill("DELETE");
  await expect.element(confirm).toBeEnabled();
  await confirm.click();
  expect(mocks.deleteAccount).toHaveBeenCalledWith("DELETE");
  await expect.element(page.getByRole("alert")).toHaveTextContent("Sign in again before deleting your account.");
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await page.getByRole("button", { name: "Delete account", exact: true }).click();
  await expect.element(confirm).toBeDisabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
});
it("allows retrying a failed export", async () => {
  mocks.exportData.mockRejectedValue(new Error("Offline"));
  await render(Preview, { screen: Settings });
  const download = page.getByRole("button", { name: "Download your data" });
  await download.click();
  expect(mocks.exportData).toHaveBeenCalledTimes(1);
  await expect.element(download).toBeEnabled();
});

it("fits light and dark themes on desktop and mobile", async () => {
  await page.viewport(1280, 1000);
  await render(Preview, { screen: Settings });
  await expect.element(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expect.poll(() => document.documentElement.scrollWidth).toBeLessThanOrEqual(1280);
  document.documentElement.classList.add("dark");
  await page.viewport(390, 844);
  await expect.poll(() => document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
});

it("opens the account menu in collapsed and mobile sidebars and allows retrying sign-out", async () => {
  await page.viewport(1280, 1000);
  mocks.signOut.mockResolvedValue({ error: { message: "Unable to sign out." } });
  await render(Preview, { screen: Settings });
  const accountMenu = page.getByRole("button", { name: "Account menu for SkyBlock Player" });
  await expect.element(accountMenu).toBeVisible();
  await expect
    .poll(() => {
      const footer = document.querySelector('[data-sidebar="footer"]');
      return footer?.getBoundingClientRect().bottom ?? Infinity;
    })
    .toBeLessThanOrEqual(window.innerHeight);
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await accountMenu.click();
  await expect
    .element(page.getByRole("menuitem", { name: "Account settings" }))
    .toHaveAttribute("href", "/dashboard/settings");
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  await accountMenu.click();
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  expect(mocks.signOut).toHaveBeenCalledTimes(1);
  await expect.element(accountMenu).toBeEnabled();
  await page.viewport(390, 844);
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await expect.element(page.getByRole("dialog")).toBeVisible();
  await accountMenu.click();
  await expect.element(page.getByRole("menuitem", { name: "Account settings" })).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
});

it("keeps navigation available while the account boundary is pending", async () => {
  await page.viewport(1280, 1000);
  const account = Promise.withResolvers<{ user: { name: string } }>();
  mocks.getDashboard.mockReturnValue(account.promise);
  await render(Preview, { screen: Settings });
  await expect.element(page.getByRole("status", { name: "Loading account menu" })).toBeVisible();
  await expect.element(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  account.resolve({ user: { name: "SkyBlock Player" } });
  await expect.element(page.getByRole("button", { name: "Account menu for SkyBlock Player" })).toBeVisible();
  await expect.element(page.getByRole("status", { name: "Loading account menu" })).not.toBeInTheDocument();
});

it("contains an account query failure in the footer boundary", async () => {
  await page.viewport(1280, 1000);
  mocks.getDashboard.mockRejectedValue(new Error("Account unavailable"));
  await render(Preview, { screen: Settings });
  await expect.element(page.getByRole("link", { name: "Account settings", exact: true })).toBeVisible();
  await expect.element(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  await expect.element(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
});
