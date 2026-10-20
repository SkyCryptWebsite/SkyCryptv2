import { EventEmitter, on } from "node:events";

/** What changed; live queries re-read the matching data. */
export type LiveEvent = "banners" | "posts";

// shortcut: in-process only, which is enough for one instance per environment. Move to Postgres LISTEN/NOTIFY when a
// deployment runs more than one instance.
const events = new EventEmitter().setMaxListeners(0);

// Shared by every connected client, which would otherwise each re-run the query on every publish.
// Expires because banner visibility depends on the current time.
const MEMO_TTL_MS = 60_000;
const memo = new Map<string, { expires: number; value: Promise<unknown> }>();

function memoized<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;
  const value = load();
  const entry = { expires: Date.now() + MEMO_TTL_MS, value };
  memo.set(key, entry);
  value.catch(() => {
    if (memo.get(key) === entry) memo.delete(key);
  });
  return value;
}

export function publish(event: LiveEvent) {
  for (const key of memo.keys()) if (key.startsWith(`${event}:`)) memo.delete(key);
  events.emit(event);
}

/**
 * Yields `load()` now and again after every matching `publish`. For `query.live`; SvelteKit stops the generator, and
 * with it the listener, when the client disconnects. `key` must distinguish calls whose `load` returns different data.
 */
export async function* watch<T>(event: LiveEvent, load: () => Promise<T>, key = "") {
  const memoKey = `${event}:${key}`;
  yield await memoized(memoKey, load);
  for await (const _ of on(events, event)) yield await memoized(memoKey, load);
}
