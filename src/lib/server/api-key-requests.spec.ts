import { describe, expect, it } from "vitest";
import {
  getEffectiveStatus,
  getRateLimitBlockReason,
  getReapplyAt,
  getRequestBlockReason,
  REAPPLY_COOLDOWN_MS
} from "./api-key-requests";

const now = new Date("2026-10-19T12:00:00Z");
const denied = (reviewedAt: Date) => ({ status: "denied" as const, reviewedAt, updatedAt: reviewedAt });

describe("getRequestBlockReason", () => {
  it("allows a first request once Minecraft is linked", () => {
    expect(getRequestBlockReason(undefined, true, now)).toBeNull();
    expect(getRequestBlockReason(undefined, false, now)).toMatch(/Minecraft/);
  });

  it("blocks while a request is open", () => {
    expect(getRequestBlockReason({ status: "pending", reviewedAt: null, updatedAt: now }, true, now)).toMatch(
      /reviewed/
    );
    expect(getRequestBlockReason({ status: "approved", reviewedAt: now, updatedAt: now }, true, now)).toMatch(
      /already/
    );
  });

  it("enforces the cooldown after a denial", () => {
    const recent = denied(new Date(now.getTime() - REAPPLY_COOLDOWN_MS + 1000));
    const old = denied(new Date(now.getTime() - REAPPLY_COOLDOWN_MS));
    expect(getRequestBlockReason(recent, true, now)).toMatch(/cooldown/);
    expect(getRequestBlockReason(old, true, now)).toBeNull();
    expect(getReapplyAt(old)).toEqual(now);
  });

  it("lets users request a new key once staff disable theirs", () => {
    expect(getEffectiveStatus("approved", false)).toBe("revoked");
    expect(getEffectiveStatus("approved", true)).toBe("approved");
    expect(getEffectiveStatus("approved", undefined)).toBe("approved");
    expect(getRequestBlockReason({ status: "revoked", reviewedAt: now, updatedAt: now }, true, now)).toBeNull();
  });
});

describe("getRateLimitBlockReason", () => {
  it("allows one pending request and applies the denial cooldown", () => {
    expect(getRateLimitBlockReason(undefined, now)).toBeNull();
    expect(getRateLimitBlockReason({ status: "approved", reviewedAt: now, updatedAt: now }, now)).toBeNull();
    expect(getRateLimitBlockReason({ status: "pending", reviewedAt: null, updatedAt: now }, now)).toMatch(/reviewed/);
    expect(getRateLimitBlockReason(denied(now), now)).toMatch(/cooldown/);
  });
});
