import { EventEmitter, on } from "node:events";

/** What changed; live queries re-read the matching data. */
export type LiveEvent = "banners" | "posts";

// shortcut: in-process only, which is enough for one instance per environment. Move to Postgres LISTEN/NOTIFY when a
// deployment runs more than one instance.
const events = new EventEmitter().setMaxListeners(0);

export function publish(event: LiveEvent) {
  events.emit(event);
}

/**
 * Yields `load()` now and again after every matching `publish`. For `query.live`; SvelteKit stops the generator, and
 * with it the listener, when the client disconnects.
 */
export async function* watch<T>(event: LiveEvent, load: () => Promise<T>) {
  yield await load();
  for await (const _ of on(events, event)) yield await load();
}
