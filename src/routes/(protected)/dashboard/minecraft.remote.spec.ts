import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  event: { locals: {} as { user?: { id: string } }, request: { headers: new Headers() } },
  getAccessToken: vi.fn(),
  getMcIdLinks: vi.fn(),
  getStoredMinecraftAccounts: vi.fn(),
  fetchMcIdProfile: vi.fn(),
  storeMinecraftAccounts: vi.fn(),
  refresh: vi.fn()
}));
vi.mock("$app/server", () => ({
  getRequestEvent: () => mocks.event,
  query: (handler: () => Promise<unknown>) =>
    Object.assign(() => Object.assign(handler(), { refresh: mocks.refresh }), { __: { type: "query" } }),
  command: (handler: () => unknown) => Object.assign(handler, { __: { type: "command" } })
}));
vi.mock("#lib/server/auth.js", () => ({ auth: { api: { getAccessToken: mocks.getAccessToken } } }));
vi.mock("#lib/server/minecraft-accounts.js", () => ({
  getMcIdLinks: mocks.getMcIdLinks,
  getStoredMinecraftAccounts: mocks.getStoredMinecraftAccounts,
  fetchMcIdProfile: mocks.fetchMcIdProfile,
  storeMinecraftAccounts: mocks.storeMinecraftAccounts
}));
import { getMinecraftAccounts, syncMinecraftAccounts } from "./minecraft.remote";

const link = { id: "local-link", accountId: "provider-subject", userId: "user", providerId: "mc-id" };
const profile = { sub: link.accountId, accounts: [] };
beforeEach(() => {
  vi.resetAllMocks();
  mocks.event.locals = { user: { id: "user" } };
  mocks.getMcIdLinks.mockResolvedValue([link]);
  mocks.getAccessToken.mockResolvedValue({ accessToken: "test-token" });
  mocks.fetchMcIdProfile.mockResolvedValue(profile);
});

it("requires authentication before reading or syncing accounts", async () => {
  mocks.event.locals = {};
  await expect(getMinecraftAccounts()).rejects.toMatchObject({ status: 401 });
  await expect(syncMinecraftAccounts()).rejects.toMatchObject({ status: 401 });
  expect(mocks.getMcIdLinks).not.toHaveBeenCalled();
  expect(mocks.getStoredMinecraftAccounts).not.toHaveBeenCalled();
});

it("refreshes the current user's local MC-ID link through Better Auth", async () => {
  expect(await syncMinecraftAccounts()).toEqual({ reconnect: false });
  expect(mocks.getMcIdLinks).toHaveBeenCalledWith("user");
  expect(mocks.getAccessToken).toHaveBeenCalledWith({
    headers: mocks.event.request.headers,
    body: { accountId: link.id }
  });
  expect(mocks.fetchMcIdProfile).toHaveBeenCalledWith("test-token");
  expect(mocks.storeMinecraftAccounts).toHaveBeenCalledWith(link, profile);
  expect(mocks.refresh).toHaveBeenCalledOnce();
});

it("rejects syncing without a linked MC-ID account", async () => {
  mocks.getMcIdLinks.mockResolvedValue([]);
  await expect(syncMinecraftAccounts()).rejects.toMatchObject({ status: 400 });
  expect(mocks.getAccessToken).not.toHaveBeenCalled();
});

it.each(["token", "userinfo"])("requests reconnection when %s authorization fails", async (failure) => {
  if (failure === "token") mocks.getAccessToken.mockRejectedValue(new Error("Expired"));
  else mocks.fetchMcIdProfile.mockResolvedValue(null);
  expect(await syncMinecraftAccounts()).toEqual({ reconnect: true });
  expect(mocks.storeMinecraftAccounts).not.toHaveBeenCalled();
});

it("keeps saved data when the provider returns invalid data", async () => {
  mocks.fetchMcIdProfile.mockRejectedValue(new Error("Incomplete response"));
  await expect(syncMinecraftAccounts()).rejects.toMatchObject({ status: 502 });
  expect(mocks.storeMinecraftAccounts).not.toHaveBeenCalled();
  expect(mocks.refresh).not.toHaveBeenCalled();
});
