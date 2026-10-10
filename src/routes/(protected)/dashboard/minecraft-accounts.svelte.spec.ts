import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import MinecraftAccounts from "./minecraft-accounts.svelte";

const mocks = vi.hoisted(() => ({ accounts: vi.fn(), sync: Object.assign(vi.fn(), { pending: 0 }), link: vi.fn() }));
vi.mock("./minecraft.remote", () => ({ getMinecraftAccounts: mocks.accounts, syncMinecraftAccounts: mocks.sync }));
vi.mock("#lib/shared/auth-client.js", () => ({ authClient: { linkSocial: mocks.link } }));
vi.mock("svelte-sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.accounts.mockResolvedValue([]);
});

it("shows an empty state when no accounts are saved", async () => {
  await render(MinecraftAccounts);
  await expect.element(page.getByText("No Minecraft accounts")).toBeVisible();
});

it("shows the saved username, UUID, and primary status", async () => {
  mocks.accounts.mockResolvedValue([
    {
      accountId: "local-account",
      uuid: "069a79f444e94726a5befca90e38aaf5",
      username: "Notch",
      primary: true,
      syncedAt: new Date("2026-09-13T12:00:00Z")
    }
  ]);
  await render(MinecraftAccounts);
  await expect.element(page.getByText("Notch", { exact: false })).toBeVisible();
  await expect.element(page.getByText("Primary", { exact: true })).toBeVisible();
  await expect.element(page.getByText("069a79f444e94726a5befca90e38aaf5", { exact: true })).toBeVisible();
});
