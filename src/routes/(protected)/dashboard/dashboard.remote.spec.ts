import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  event: {
    locals: {} as { user?: { id: string; name: string; image: null; createdAt: Date; email: string } },
    request: { headers: new Headers() }
  },
  listUserAccounts: vi.fn(),
  getStoredPatreonMembership: vi.fn(),
  getPatreonVerificationRetryAt: vi.fn(),
  verifyPatreonMembership: vi.fn(),
  refresh: vi.fn()
}));

vi.mock("$app/server", () => ({
  getRequestEvent: () => mocks.event,
  query: (handler: () => Promise<unknown>) =>
    Object.assign(() => Object.assign(handler(), { refresh: mocks.refresh }), { __: { type: "query" } }),
  command: (handler: () => unknown) => Object.assign(handler, { __: { type: "command" } })
}));
vi.mock("$lib/server/auth", () => ({ auth: { api: { listUserAccounts: mocks.listUserAccounts } } }));
vi.mock("$lib/server/patreon", () => ({
  getStoredPatreonMembership: mocks.getStoredPatreonMembership,
  getPatreonVerificationRetryAt: mocks.getPatreonVerificationRetryAt,
  verifyPatreonMembership: mocks.verifyPatreonMembership,
  PatreonVerificationError: class extends Error {
    constructor(
      message: string,
      readonly code: string
    ) {
      super(message);
    }
  }
}));

import { PatreonVerificationError } from "$lib/server/patreon";
import { getDashboard, verifyMembership } from "./dashboard.remote";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.event.locals = {};
  mocks.listUserAccounts.mockResolvedValue([]);
  mocks.getPatreonVerificationRetryAt.mockResolvedValue(null);
});

function signIn() {
  mocks.event.locals.user = {
    id: "current-user",
    name: "Player",
    image: null,
    createdAt: new Date("2026-01-01"),
    email: "private@example.com"
  };
}

it("requires authentication for dashboard reads and membership verification", async () => {
  await expect(getDashboard()).rejects.toMatchObject({ status: 401 });
  await expect(verifyMembership()).rejects.toMatchObject({ status: 401 });
  expect(mocks.listUserAccounts).not.toHaveBeenCalled();
  expect(mocks.verifyPatreonMembership).not.toHaveBeenCalled();
});

it("loads the signed-in user's membership and returns only public account metadata", async () => {
  signIn();
  const account = { id: "account", accountId: "provider-user", providerId: "discord", createdAt: new Date() };
  mocks.listUserAccounts.mockResolvedValue([{ ...account, accessToken: "secret", refreshToken: "secret" }]);
  mocks.getStoredPatreonMembership.mockResolvedValue({ entitlementLevel: 1 });

  const result = await getDashboard();
  expect(result).toEqual({
    user: { id: "current-user", name: "Player", image: null, createdAt: new Date("2026-01-01") },
    accounts: [account],
    membership: { entitlementLevel: 1 },
    verificationRetryAt: null
  });
  expect(mocks.getStoredPatreonMembership).toHaveBeenCalledWith("current-user");
  expect(mocks.listUserAccounts).toHaveBeenCalledWith({ headers: mocks.event.request.headers });
});

it.each([
  ["rate_limited", 429],
  ["already_claimed", 409],
  ["not_linked", 400]
] as const)("returns the appropriate status for %s", async (code, status) => {
  signIn();
  mocks.verifyPatreonMembership.mockRejectedValue(new PatreonVerificationError("Expected failure", code));
  await expect(verifyMembership()).rejects.toMatchObject({ status, body: { message: "Expected failure" } });
  expect(mocks.refresh).not.toHaveBeenCalled();
});

it("hides unexpected provider errors from clients", async () => {
  signIn();
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.verifyPatreonMembership.mockRejectedValue(new Error("Private provider response"));
  try {
    await expect(verifyMembership()).rejects.toMatchObject({
      status: 500,
      body: { message: "Patreon verification failed unexpectedly." }
    });
    expect(mocks.refresh).not.toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});

it("verifies the current user and refreshes dashboard data after success", async () => {
  signIn();
  await verifyMembership();
  expect(mocks.verifyPatreonMembership).toHaveBeenCalledWith("current-user");
  expect(mocks.refresh).toHaveBeenCalledOnce();
});

it("returns the in-memory retry time for the current user", async () => {
  signIn();
  const retryAt = new Date(Date.now() + 60_000);
  mocks.getPatreonVerificationRetryAt.mockResolvedValue(retryAt);
  expect((await getDashboard()).verificationRetryAt).toEqual(retryAt);
  expect(mocks.getPatreonVerificationRetryAt).toHaveBeenCalledWith("current-user");
});
