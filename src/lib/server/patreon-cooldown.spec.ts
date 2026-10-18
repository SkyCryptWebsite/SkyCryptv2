import { afterEach, expect, it, vi } from "vitest";
import { claimPatreonVerification, getPatreonVerificationRetryAt } from "./patreon-cooldown";

afterEach(() => vi.useRealTimers());

it("limits each user independently and permits retries exactly one minute later", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-03T12:00:00Z"));
  expect(getPatreonVerificationRetryAt("patron")).toBeNull();
  expect(claimPatreonVerification("patron")).toBe(true);
  expect(claimPatreonVerification("patron")).toBe(false);
  expect(claimPatreonVerification("another-patron")).toBe(true);
  expect(getPatreonVerificationRetryAt("patron")).toEqual(new Date("2026-10-03T12:01:00Z"));
  vi.advanceTimersByTime(59_999);
  expect(claimPatreonVerification("patron")).toBe(false);
  vi.advanceTimersByTime(1);
  expect(getPatreonVerificationRetryAt("patron")).toBeNull();
  expect(claimPatreonVerification("patron")).toBe(true);
});
