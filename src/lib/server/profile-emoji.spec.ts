import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
  upsert: vi.fn()
}));
vi.mock("#lib/server/db/index.js", () => ({ db: { transaction: mocks.transaction } }));

import { saveProfileEmoji } from "./profile-emoji";

const uuid = "a".repeat(32);

beforeEach(() => {
  vi.resetAllMocks();
  mocks.transaction.mockImplementation(async (handler) => handler({ select: mocks.select, insert: mocks.insert }));
  mocks.select.mockImplementation(() => ({
    from: () => ({
      innerJoin: () => ({ where: () => ({ for: async () => [{ id: "owner" }] }) }),
      where: async () => []
    })
  }));
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.values.mockReturnValue({ onConflictDoUpdate: mocks.upsert });
});

function storedLevels(grant: number | null, membership: number | null) {
  for (const level of [grant, membership]) {
    mocks.select.mockImplementationOnce(() => ({
      from: () => ({ where: async () => (level === null ? [] : [{ entitlementLevel: level }]) })
    }));
  }
}

it.each([
  ["invalid", "❤️"],
  [uuid, "hello"],
  [uuid, "🦆🦆"]
])("rejects invalid save input before accessing the database", async (accountUuid, emoji) => {
  await expect(saveProfileEmoji("user", accountUuid, emoji)).rejects.toMatchObject({ status: 400 });
  expect(mocks.transaction).not.toHaveBeenCalled();
});

it("rejects an account the current user does not own before looking up perks", async () => {
  mocks.select.mockImplementationOnce(() => ({
    from: () => ({ innerJoin: () => ({ where: () => ({ for: async () => [] }) }) })
  }));
  await expect(saveProfileEmoji("other-user", uuid, "❤️")).rejects.toMatchObject({ status: 403 });
  expect(mocks.select).toHaveBeenCalledOnce();
  expect(mocks.insert).not.toHaveBeenCalled();
});

it.each([
  [null, null, "❤️", false],
  [0, 0, "❤️", false],
  [1, null, "🦆", false],
  [null, 1, "🦆", false],
  [1, 1, "🦆", false],
  [null, 3, "🦆", false],
  [1, null, " ❤ ", true],
  [null, 1, "💙", true],
  [2, null, "🦆", true],
  [null, 2, "👩🏽‍💻", true],
  [2, 0, "🇨🇿", true],
  [1, 2, "🦆", true]
])("enforces stored grant %s and membership %s for %s", async (grant, membership, emoji, allowed) => {
  const ownerSelect = mocks.select.getMockImplementation()!;
  mocks.select.mockImplementationOnce(ownerSelect);
  storedLevels(grant, membership);
  if (!allowed) {
    await expect(saveProfileEmoji("user", uuid, emoji)).rejects.toMatchObject({ status: 403 });
    expect(mocks.insert).not.toHaveBeenCalled();
    return;
  }

  await saveProfileEmoji("user", uuid, emoji);
  expect(mocks.values).toHaveBeenCalledWith({
    uuid,
    emoji: emoji === " ❤ " ? "❤️" : emoji,
    entitlementLevel: Math.max(grant ?? 0, membership ?? 0)
  });
  expect(mocks.upsert).toHaveBeenCalledOnce();
});
