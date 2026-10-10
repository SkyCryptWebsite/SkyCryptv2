import { PUBLIC_SENTRY_HOST, PUBLIC_SENTRY_PROJECT_ID } from "$app/env/public";
import type { RequestHandler } from "./$types";

const SENTRY_PROJECT_IDS = [PUBLIC_SENTRY_PROJECT_ID];

export const POST: RequestHandler = async ({ request }) => {
  try {
    const envelopeBytes = await request.arrayBuffer();
    const envelope = new TextDecoder().decode(envelopeBytes);
    const piece = envelope.split("\n")[0];
    const header = JSON.parse(piece);
    const dsn = new URL(header["dsn"]);
    const project_id = dsn.pathname?.replace("/", "");

    if (dsn.hostname !== PUBLIC_SENTRY_HOST) {
      throw new Error(`Invalid sentry hostname: ${dsn.hostname}`);
    }

    if (!project_id || !SENTRY_PROJECT_IDS.includes(project_id)) {
      throw new Error(`Invalid sentry project id: ${project_id}`);
    }

    const upstream_sentry_url = `https://${PUBLIC_SENTRY_HOST}/api/${project_id}/envelope/`;
    await fetch(upstream_sentry_url, {
      method: "POST",
      body: envelopeBytes
    });

    return Response.json({}, { status: 200 });
  } catch (e) {
    console.error("error tunneling to sentry", e);
    return Response.json({ error: "error tunneling to sentry" }, { status: 500 });
  }
};
