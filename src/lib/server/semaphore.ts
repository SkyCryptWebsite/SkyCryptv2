export class QueueFullError extends Error {}

/**
 * Limits concurrent work; extra callers wait in a bounded queue until a slot frees, the wait times out or `signal`
 * aborts.
 */
export function createSemaphore({
  limit,
  maxQueue,
  timeoutMs
}: {
  limit: number;
  maxQueue: number;
  timeoutMs: number;
}) {
  let active = 0;
  const queue: (() => void)[] = [];

  async function acquire(signal: AbortSignal) {
    if (active < limit) {
      active++;
      return;
    }
    if (queue.length >= maxQueue) throw new QueueFullError("Queue is full");

    const { promise, resolve, reject } = Promise.withResolvers<void>();
    const wait = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
    const onAbort = () => {
      const index = queue.indexOf(resolve);
      // Already handed a slot by release().
      if (index === -1) return;
      queue.splice(index, 1);
      reject(wait.reason);
    };
    wait.addEventListener("abort", onAbort, { once: true });
    queue.push(resolve);
    try {
      await promise;
    } finally {
      wait.removeEventListener("abort", onAbort);
    }
  }

  function release() {
    const next = queue.shift();
    if (next) next();
    else active--;
  }

  return {
    acquire,
    release,
    get active() {
      return active;
    },
    get queued() {
      return queue.length;
    }
  };
}
