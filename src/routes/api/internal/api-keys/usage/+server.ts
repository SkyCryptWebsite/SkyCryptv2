import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireBackendToken } from "#lib/server/backend-auth";
import { db } from "#lib/server/db";
import { apikey } from "#lib/server/db/schema";
import type { RequestHandler } from "./$types";

const bodySchema = z.object({
  keys: z
    .array(
      z.object({
        id: z.string().min(1),
        requestCount: z.number().int().nonnegative(),
        lastRequest: z.number().int().positive()
      })
    )
    .max(500)
});

/**
 * The Go backend enforces API key rate limits in Redis and reports each key's count for its current window here, so
 * `requestCount` and `lastRequest` show real usage for moderation. Values are absolute, so a retried sync is harmless.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  requireBackendToken(request);
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) error(400, "Invalid body");

  await db.transaction(async (tx) => {
    for (const usage of body.data.keys) {
      await tx
        .update(apikey)
        .set({ requestCount: usage.requestCount, lastRequest: new Date(usage.lastRequest) })
        .where(eq(apikey.id, usage.id));
    }
  });
  locals.log.set({ apiKeyUsage: { keys: body.data.keys.length } });
  return new Response(null, { status: 204 });
};
