import { afterEach, describe, expect, it, vi } from "vitest";
import { publish, watch } from "./live";

const first = async <T>(generator: AsyncGenerator<T>) => {
  const { value } = await generator.next();
  await generator.return(undefined);
  return value;
};

describe("watch", () => {
  afterEach(() => {
    vi.useRealTimers();
    publish("banners");
  });

  it("shares one load across clients until a publish", async () => {
    const load = vi.fn(async () => load.mock.calls.length);
    expect(await first(watch("banners", load))).toBe(1);
    expect(await first(watch("banners", load))).toBe(1);
    publish("banners");
    expect(await first(watch("banners", load))).toBe(2);
  });

  it("keeps keys apart and reloads after the TTL", async () => {
    vi.useFakeTimers();
    const load = vi.fn(async () => "posts");
    await first(watch("banners", load, "a"));
    await first(watch("banners", load, "b"));
    expect(load).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(60_001);
    await first(watch("banners", load, "a"));
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("does not cache a failed load", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("db down")).mockResolvedValue("ok");
    await expect(first(watch("banners", load))).rejects.toThrow("db down");
    expect(await first(watch("banners", load))).toBe("ok");
  });
});
