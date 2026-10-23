import { error } from "@sveltejs/kit";
import { z } from "zod";
import { auth } from "#lib/server/auth";
import { requireBackendToken } from "#lib/server/backend-auth";
import type { RequestHandler } from "./$types";

const bodySchema = z.object({ key: z.string().min(1).max(256) });

/**
 * Verifies an API key for the Go backend, since Better Auth only exposes `verifyApiKey` on the server. The backend
 * caches the result and enforces rate limits itself, so only the fields it needs are returned.
 */
export const POST: RequestHandler = async ({ request }) => {
  requireBackendToken(request);
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) error(400, "Invalid body");

  const result = await auth.api.verifyApiKey({ body: { key: body.data.key } });
  const { key } = result;
  return Response.json({
    valid: result.valid,
    error: result.error && { code: result.error.code, message: result.error.message },
    key: key && {
      id: key.id,
      permissions: key.permissions,
      rateLimitEnabled: key.rateLimitEnabled,
      rateLimitMax: key.rateLimitMax,
      rateLimitTimeWindow: key.rateLimitTimeWindow
    }
  });
};
