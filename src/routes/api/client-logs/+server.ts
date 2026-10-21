import { error } from "@sveltejs/kit";
import { allowClientLog, sanitizeClientLog } from "#lib/server/client-logs";
import type { RequestHandler } from "./$types";

const MAX_BODY_BYTES = 8192;

/**
 * Receives browser logs from `evlog/client`. Intentionally unauthenticated (logged-out users hit errors too), so the
 * payload is untrusted: same-origin only, size capped, rate limited per IP, and flattened by `sanitizeClientLog`. The
 * request's own wide event becomes the client log, so it already carries the user, user agent and country.
 */
export const POST: RequestHandler = async ({ request, url, locals, getClientAddress }) => {
  const source = request.headers.get("origin") ?? request.headers.get("referer");
  // Compare with the host the browser used (not the build-time ORIGIN), like headersHandler does.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  if (!source || !URL.canParse(source) || new URL(source).host !== host) error(403, "Invalid origin");
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) error(413, "Payload too large");
  let address = "unknown";
  try {
    address = getClientAddress();
  } catch {
    // ADDRESS_HEADER is set but missing on this request; rate limit it with the other unidentified clients.
  }
  if (!allowClientLog(address)) error(429, "Too many requests");

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) error(413, "Payload too large");

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    error(400, "Invalid JSON");
  }

  const entry = sanitizeClientLog(body);
  if (entry) {
    locals.log.set({ source: "client", client: entry.client });
    locals.log.setLevel(entry.level);
  }
  return new Response(null, { status: 204 });
};
