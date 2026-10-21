import { describe, expect, it } from "vitest";
import { can, primaryRole, roleRank, UserRole } from "./roles";

describe("roles", () => {
  it("follows the staff permission matrix", () => {
    const review = { apiAccess: ["review"] } as const;
    const ban = { user: ["ban"] } as const;
    const setRole = { user: ["set-role"] } as const;

    expect(can(undefined, { dashboard: ["view"] })).toBe(false);
    expect(can("trial-moderator", { dashboard: ["view"], user: ["list"] })).toBe(true);
    expect(can("trial-moderator", review)).toBe(false);
    expect(can("moderator", review)).toBe(true);
    expect(can("moderator", ban)).toBe(false);
    expect(can("head-moderator", ban)).toBe(true);
    expect(can("head-moderator", setRole)).toBe(false);
    expect(can("admin", setRole)).toBe(true);
    expect(can("admin", { user: ["impersonate"] })).toBe(false);
  });

  it("ranks comma-separated roles by their highest role", () => {
    expect(roleRank(null)).toBe(0);
    expect(roleRank("user")).toBe(0);
    expect(roleRank("user,moderator")).toBe(2);
    expect(roleRank("admin")).toBe(4);
    expect(primaryRole("moderator,head-moderator")).toBe(UserRole.HeadModerator);
    expect(can("user,moderator", { apiAccess: ["review"] })).toBe(true);
  });
});
