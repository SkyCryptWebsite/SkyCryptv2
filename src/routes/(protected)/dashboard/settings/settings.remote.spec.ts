import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  event: { request: { headers: new Headers() } },
  getSession: vi.fn(),
  listSessions: vi.fn(),
  revokeSession: vi.fn(),
  signOut: vi.fn(),
  exportAccountData: vi.fn(),
  deleteAccountData: vi.fn()
}));
vi.mock("$app/server", () => ({
  getRequestEvent: () => mocks.event,
  query: (handler: () => unknown) => Object.assign(handler, { __: { type: "query" } }),
  command: (schemaOrHandler: object, handler?: (...args: unknown[]) => unknown) =>
    Object.assign(handler ?? schemaOrHandler, { __: { type: "command" } })
}));
vi.mock("#lib/server/auth.js", () => ({ auth: { api: mocks } }));
vi.mock("#lib/server/account-data.js", () => mocks);
import { deleteAccount, exportData, getSessions, revokeSession } from "./settings.remote";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getSession.mockResolvedValue(null);
});
const signIn = (createdAt = new Date(), impersonatedBy: string | null = null) =>
  mocks.getSession.mockResolvedValue({
    user: { id: "user" },
    session: { token: "current-secret", createdAt, impersonatedBy }
  });

it("rejects unauthenticated reads and mutations", async () => {
  for (const call of [
    () => getSessions(),
    () => exportData(),
    () => deleteAccount("DELETE"),
    () => revokeSession("other")
  ]) {
    await expect(call()).rejects.toMatchObject({ status: 401 });
  }
  expect(mocks.listSessions).not.toHaveBeenCalled();
  expect(mocks.exportAccountData).not.toHaveBeenCalled();
  expect(mocks.deleteAccountData).not.toHaveBeenCalled();
});
it("sorts the current session first without returning authentication tokens", async () => {
  signIn();
  const metadata = {
    userAgent: "Test browser",
    ipAddress: "127.0.0.1",
    createdAt: new Date("2026-01-01"),
    expiresAt: new Date("2026-01-08")
  };
  mocks.listSessions.mockResolvedValue([
    { ...metadata, id: "other", token: "other-secret", userId: "user" },
    { ...metadata, id: "current", token: "current-secret", userId: "user" }
  ]);
  await expect(getSessions()).resolves.toEqual([
    { ...metadata, id: "current", current: true },
    { ...metadata, id: "other", current: false }
  ]);
  expect(mocks.getSession).toHaveBeenCalledWith({
    headers: mocks.event.request.headers,
    query: { disableCookieCache: true }
  });
});
it("only revokes another session owned by the signed-in user", async () => {
  signIn();
  mocks.listSessions.mockResolvedValue([
    { id: "current", token: "current-secret" },
    { id: "other", token: "other-secret" }
  ]);
  await expect(revokeSession("stranger")).rejects.toMatchObject({ status: 404 });
  await expect(revokeSession("current")).rejects.toMatchObject({ status: 400 });
  expect(mocks.revokeSession).not.toHaveBeenCalled();
  await revokeSession("other");
  expect(mocks.revokeSession).toHaveBeenCalledWith({
    headers: mocks.event.request.headers,
    body: { token: "other-secret" }
  });
});
it("exports only the authenticated user's data", async () => {
  signIn();
  mocks.exportAccountData.mockResolvedValue({ profile: { id: "user" } });
  await expect(exportData()).resolves.toEqual({ profile: { id: "user" } });
  expect(mocks.exportAccountData).toHaveBeenCalledWith("user");
});
it("requires a recent session and prevents deletion while impersonating", async () => {
  signIn(new Date(Date.now() - 86_400_000));
  await expect(deleteAccount("DELETE")).rejects.toMatchObject({ status: 403 });
  signIn(new Date(), "admin");
  await expect(deleteAccount("DELETE")).rejects.toMatchObject({ status: 403 });
  expect(mocks.deleteAccountData).not.toHaveBeenCalled();
  expect(mocks.signOut).not.toHaveBeenCalled();
});
it("deletes the authenticated account and clears its sign-in cookies", async () => {
  signIn();
  await deleteAccount("DELETE");
  expect(mocks.deleteAccountData).toHaveBeenCalledWith("user");
  expect(mocks.signOut).toHaveBeenCalledWith({ headers: mocks.event.request.headers });
});
it("does not report success or sign out if deletion fails", async () => {
  signIn();
  mocks.deleteAccountData.mockRejectedValue(new Error("Database unavailable"));
  await expect(deleteAccount("DELETE")).rejects.toThrow("Database unavailable");
  expect(mocks.signOut).not.toHaveBeenCalled();
});
