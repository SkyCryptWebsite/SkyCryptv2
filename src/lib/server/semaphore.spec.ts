import { describe, expect, it } from "vitest";
import { createSemaphore, QueueFullError } from "./semaphore";

const never = new AbortController().signal;

describe("createSemaphore", () => {
  it("queues past the limit and hands slots over in order", async () => {
    const semaphore = createSemaphore({ limit: 1, maxQueue: 2, timeoutMs: 1000 });
    await semaphore.acquire(never);
    const order: number[] = [];
    const second = semaphore.acquire(never).then(() => order.push(2));
    const third = semaphore.acquire(never).then(() => order.push(3));
    expect(semaphore.queued).toBe(2);

    semaphore.release();
    await second;
    semaphore.release();
    await third;
    expect(order).toEqual([2, 3]);
    expect(semaphore.active).toBe(1);
    semaphore.release();
    expect(semaphore.active).toBe(0);
  });

  it("rejects when the queue is full", async () => {
    const semaphore = createSemaphore({ limit: 1, maxQueue: 0, timeoutMs: 1000 });
    await semaphore.acquire(never);
    await expect(semaphore.acquire(never)).rejects.toBeInstanceOf(QueueFullError);
  });

  it("leaves the queue on timeout or abort without leaking a slot", async () => {
    const semaphore = createSemaphore({ limit: 1, maxQueue: 5, timeoutMs: 20 });
    await semaphore.acquire(never);
    await expect(semaphore.acquire(never)).rejects.toThrow();

    const controller = new AbortController();
    const aborted = semaphore.acquire(controller.signal);
    controller.abort();
    await expect(aborted).rejects.toThrow();
    expect(semaphore.queued).toBe(0);

    semaphore.release();
    expect(semaphore.active).toBe(0);
  });
});
