import { describe, expect, it } from "vitest";
import { params } from "./params";

const uuid = "dec987bbfa734d63bb9d566139232f81";
const dashed = "dec987bb-fa73-4d63-bb9d-566139232f81";
const unsafe = ["", ".", "..", "a?b", "a#b", "a\\b", "a/b", "%2e%2e", "a b"];

const matches = (name: keyof typeof params, value: string) =>
  !(params[name]["~standard"].validate(value) as { issues?: unknown }).issues;

describe("route param matchers", () => {
  it("accepts usernames and UUIDs as ign", () => {
    for (const value of ["TiltedHoney", "x", "Some_User_123456", uuid, dashed])
      expect(matches("ign", value), value).toBe(true);
  });

  it("accepts cute names and UUIDs as profile", () => {
    for (const value of ["Apple", "zucchini", uuid, dashed]) expect(matches("profile", value), value).toBe(true);
  });

  it("rejects unsafe or oversized values", () => {
    for (const value of [...unsafe, "a".repeat(17)]) expect(matches("ign", value), value).toBe(false);
    for (const value of [...unsafe, "Apple1"]) expect(matches("profile", value), value).toBe(false);
  });
});
