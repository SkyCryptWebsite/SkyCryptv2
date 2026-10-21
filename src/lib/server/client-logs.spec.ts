import { describe, expect, it } from "vitest";
import { createRateLimiter, sanitizeClientLog } from "./client-logs";

describe("sanitizeClientLog", () => {
  it("keeps tag/message and nests everything under client", () => {
    const entry = sanitizeClientLog({ level: "warn", service: "web", tag: "cart", message: "slow", userId: "u1" });
    expect(entry).toEqual({ level: "warn", client: { tag: "cart", message: "slow", userId: "u1" } });
  });

  it("maps fatal to error and drops debug, trace and garbage", () => {
    expect(sanitizeClientLog({ level: "fatal" })?.level).toBe("error");
    expect(sanitizeClientLog({ level: "debug" })).toBeNull();
    expect(sanitizeClientLog({ level: "trace" })).toBeNull();
    expect(sanitizeClientLog("nope")).toBeNull();
    expect(sanitizeClientLog([{ level: "info" }])).toBeNull();
  });

  it("cannot override server fields and caps sizes, keys and nesting", () => {
    const entry = sanitizeClientLog({
      level: "info",
      path: "/admin",
      nested: { a: 1 },
      "bad key": "x",
      message: "m".repeat(5000),
      error: { name: "TypeError", stack: "s".repeat(5000) },
      ...Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`k${i}`, i]))
    });
    const client = entry!.client;
    expect(client.message).toHaveLength(500);
    expect((client.error as { stack: string }).stack).toHaveLength(2000);
    expect(client).not.toHaveProperty("nested");
    expect(client).not.toHaveProperty("bad key");
    // path is just another extra key under client, never a top-level server field
    expect(entry).not.toHaveProperty("path");
    expect(Object.keys(client).filter((k) => /^k\d+$/.test(k))).toHaveLength(19);
  });

  it("ignores an invalid timestamp", () => {
    expect(sanitizeClientLog({ level: "info", timestamp: "not a date" })!.client).not.toHaveProperty("timestamp");
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit per window, then resets", () => {
    let t = 0;
    const allow = createRateLimiter(2, 1000, () => t);
    expect([allow("a"), allow("a"), allow("a"), allow("b")]).toEqual([true, true, false, true]);
    t = 1001;
    expect(allow("a")).toBe(true);
  });
});
