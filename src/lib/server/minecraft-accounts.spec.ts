import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fetchMcIdProfile, parseMcIdProfile, storeMinecraftAccounts } from "./minecraft-accounts";

const database = vi.hoisted(() => ({
  transaction: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  for: vi.fn(),
  delete: vi.fn(),
  insert: vi.fn(),
  values: vi.fn()
}));
vi.mock("$lib/server/db", () => ({ db: database }));

const link = { id: "local-link", accountId: "provider-subject", userId: "user", providerId: "mc-id" };
const minecraft = { uuid: "12345678123412341234123456789abc", username: "New_Name", primary: true };

beforeEach(() => {
  vi.resetAllMocks();
  database.transaction.mockImplementation((handler) => handler(database));
  for (const method of [database.select, database.from, database.where, database.delete, database.insert])
    method.mockReturnValue(database);
  database.for.mockResolvedValue([{ id: link.id }]);
  database.values.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllGlobals());

it("normalizes UUIDs and preserves multiple accounts and primary selection", () => {
  expect(
    parseMcIdProfile({
      sub: link.accountId,
      accounts: [
        { ...minecraft, uuid: "12345678-1234-1234-1234-123456789ABC" },
        { ...minecraft, uuid: "abcdefabcdefabcdefabcdefabcdefab", primary: false }
      ]
    })?.accounts
  ).toEqual([minecraft, { ...minecraft, uuid: "abcdefabcdefabcdefabcdefabcdefab", primary: false }]);
});

it("rejects missing account claims while accepting an explicitly empty snapshot", () => {
  expect(parseMcIdProfile({ sub: link.accountId })).toBeNull();
  expect(parseMcIdProfile({ sub: link.accountId, accounts: [] })).toEqual({ sub: link.accountId, accounts: [] });
});

it.each([
  [{ ...minecraft }, { ...minecraft, uuid: "12345678-1234-1234-1234-123456789ABC", primary: false }],
  [{ ...minecraft }, { ...minecraft, uuid: "abcdefabcdefabcdefabcdefabcdefab" }],
  [{ ...minecraft, uuid: "invalid" }],
  [{ ...minecraft, username: "../invalid" }]
])("rejects duplicate UUIDs, multiple primary accounts, and invalid identities: %j", (...accounts) => {
  expect(parseMcIdProfile({ sub: link.accountId, accounts })).toBeNull();
});

it("replaces usernames and account snapshots inside a transaction", async () => {
  await storeMinecraftAccounts(link, { sub: link.accountId, accounts: [minecraft] });
  expect(database.transaction).toHaveBeenCalledOnce();
  expect(database.for).toHaveBeenCalledWith("update");
  expect(database.delete).toHaveBeenCalledOnce();
  expect(database.values).toHaveBeenCalledWith([{ ...minecraft, accountId: link.id, syncedAt: expect.any(Date) }]);
  expect(database.delete.mock.invocationCallOrder[0]).toBeLessThan(database.insert.mock.invocationCallOrder[0]);
});

it("clears accounts only for an explicit empty snapshot", async () => {
  await storeMinecraftAccounts(link, { sub: link.accountId, accounts: [] });
  expect(database.delete).toHaveBeenCalledOnce();
  expect(database.insert).not.toHaveBeenCalled();
});

it("rejects a mismatched provider subject before modifying data", async () => {
  await expect(storeMinecraftAccounts(link, { sub: "another-user", accounts: [] })).rejects.toThrow("does not match");
  expect(database.transaction).not.toHaveBeenCalled();
});

it("does not save accounts after the MC-ID link has been removed", async () => {
  database.for.mockResolvedValue([]);
  await expect(storeMinecraftAccounts(link, { sub: link.accountId, accounts: [minecraft] })).rejects.toThrow(
    "no longer linked"
  );
  expect(database.delete).not.toHaveBeenCalled();
});

it("fetches userinfo with a bearer token and rejects incomplete successful responses", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ sub: link.accountId }));
  vi.stubGlobal("fetch", fetch);
  await expect(fetchMcIdProfile("test-token")).rejects.toThrow("incomplete");
  expect(fetch).toHaveBeenCalledWith(
    "https://mc-id.com/api/auth/oauth2/userinfo",
    expect.objectContaining({
      headers: { Authorization: "Bearer test-token" },
      redirect: "error"
    })
  );
});

it.each([401, 403])("requires reconnection when userinfo returns %s", async (status) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status })));
  expect(await fetchMcIdProfile("test-token")).toBeNull();
});
