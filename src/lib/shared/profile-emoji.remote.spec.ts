import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ select: vi.fn(), where: vi.fn() }));
vi.mock("$app/server", () => ({
  query: (_schema: unknown, handler: unknown) => Object.assign(handler as object, { __: { type: "query" } })
}));
vi.mock("$lib/server/db", () => ({ db: { select: mocks.select } }));

import { getProfileEmoji } from "./profile-emoji.remote";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.select.mockReturnValue({ from: () => ({ where: mocks.where }) });
});

it.each([
  [0, "❤️", null],
  [1, "🦆", null],
  [1, "💙", "💙"],
  [1, "❤", "❤️"],
  [2, "🦆", "🦆"],
  [2, "hello", null],
  [2, "🦆🦆", null],
  [3, "🦆", null]
])("checks stored entitlement %s before returning %s", async (entitlementLevel, emoji, result) => {
  mocks.where.mockResolvedValue([{ emoji, entitlementLevel }]);
  await expect(getProfileEmoji("a".repeat(32))).resolves.toBe(result);
});

it("returns no emoji when the profile has no permanent grant", async () => {
  mocks.where.mockResolvedValue([]);
  await expect(getProfileEmoji("a".repeat(32))).resolves.toBeNull();
});
