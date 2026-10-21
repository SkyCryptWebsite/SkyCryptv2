export type ClientLogLevel = "info" | "warn" | "error";
export type ClientLogEntry = { level: ClientLogLevel; client: Record<string, unknown> };

const MAX_STRING = 500;
const MAX_STACK = 2000;
const MAX_EXTRA_KEYS = 20;
const KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;
// Keys evlog's client adds itself, or that we handle explicitly below.
const RESERVED = new Set(["timestamp", "level", "service", "tag", "message", "error"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const clip = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : undefined);

/**
 * Turns an untrusted browser payload into a flat, size-capped record, or null when it should be dropped (debug/trace or
 * malformed). Everything lands under `client`, so it can never overwrite server-set fields like `level` or `path`.
 */
export function sanitizeClientLog(body: unknown): ClientLogEntry | null {
  if (!isRecord(body)) return null;
  const level = body.level === "fatal" ? "error" : body.level;
  if (level !== "info" && level !== "warn" && level !== "error") return null;

  const client: Record<string, unknown> = {};
  const tag = clip(body.tag, 100);
  const message = clip(body.message, MAX_STRING);
  if (tag) client.tag = tag;
  if (message) client.message = message;

  if (typeof body.timestamp === "string" && !Number.isNaN(Date.parse(body.timestamp))) {
    client.timestamp = new Date(body.timestamp).toISOString();
  }

  if (isRecord(body.error)) {
    client.error = {
      name: clip(body.error.name, 100),
      message: clip(body.error.message, MAX_STRING),
      stack: clip(body.error.stack, MAX_STACK)
    };
  }

  let extras = 0;
  for (const [key, value] of Object.entries(body)) {
    if (RESERVED.has(key) || !KEY_PATTERN.test(key) || extras >= MAX_EXTRA_KEYS) continue;
    if (typeof value === "string") client[key] = value.slice(0, MAX_STRING);
    else if (typeof value === "number" || typeof value === "boolean") client[key] = value;
    else continue;
    extras++;
  }

  return { level, client };
}

/**
 * Fixed-window limiter per key. shortcut: in-memory, so each server instance counts on its own; move to Redis if the
 * frontend runs multiple replicas.
 */
export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (key: string): boolean => {
    const t = now();
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return true;
    }
    entry.count++;
    return entry.count <= limit;
  };
}

export const allowClientLog = createRateLimiter(30, 60_000);
