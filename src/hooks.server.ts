import { building, dev } from "$app/env";
import { LOKI_API_KEY, LOKI_ENDPOINT, LOKI_TENANT_ID } from "$app/env/private";
import { PUBLIC_CMS_URL } from "$app/env/public";
import { runMigrations } from "$src/lib/server/db/migrate";
import { sequence, type Handle, type HandleServerError, type ServerInit } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { initLogger, log, toLoggerConfig, toMiddlewareOptions, type DrainContext } from "evlog";
import { identifyUser } from "evlog/better-auth";
import { createFsDrain } from "evlog/fs";
import { createLokiDrain } from "evlog/loki";
import { createDrainPipeline } from "evlog/pipeline";
import { createEvlogHooks } from "evlog/sveltekit";
import { auth } from "#lib/server/auth.js";
import { UserRole } from "#lib/shared/roles.js";
import evlogConfig from "../evlog.config";

// Loki in production (batched, retried), local NDJSON in dev for `evlog logs`. Stdout always stays on.
const lokiDrain = LOKI_ENDPOINT
  ? createDrainPipeline<DrainContext>({
      batch: { size: 100, intervalMs: 5000 },
      retry: { maxAttempts: 3 },
      onDropped: (events, error) =>
        log.warn("evlog", `Dropped ${events.length} events: ${error?.message ?? "buffer full"}`)
    })(
      createLokiDrain({
        endpoint: LOKI_ENDPOINT,
        apiKey: LOKI_API_KEY || undefined,
        tenantId: LOKI_TENANT_ID || undefined
      })
    )
  : undefined;
const drain = lokiDrain ?? (dev ? createFsDrain({ maxFiles: 7 }) : undefined);

initLogger({ ...toLoggerConfig(evlogConfig), drain });

const { handle: evlogHandle } = createEvlogHooks({ ...toMiddlewareOptions(evlogConfig), drain });

// Not evlog's own handleError: since 2.33.1 it returns the right status (evloghq/evlog#911), but it still logs every Error as
// level error, so each bot-scan 404 would page as an error.
// Only unexpected errors are logged; returning nothing keeps SvelteKit's default status and message.
export const handleError: HandleServerError = ({ kind, error, event }) => {
  if (kind !== "unknown") return;
  if (error instanceof Error) event.locals.log?.error(error);
  else log.error({ action: "request.unhandled_error", path: event.url.pathname, error });
};

// Buffered events are lost on a redeploy otherwise.
process.on("SIGTERM", () => void lokiDrain?.flush());

// Returned instead of thrown via `redirect()`: evlog's handle would log a thrown Redirect as a 500 error.
const redirectTo = (location: string) => new Response(null, { status: 307, headers: { location } });

const protectedRouteGroupName = "(protected)";
const protectedAdminRouteGroupName = "(admin)";
const signInPath = "/login";

export const init: ServerInit = async () => {
  if (building) {
    log.info("startup", "Skipping migrations during build.");
    return;
  }
  await runMigrations();

  // Node 24's default --unhandled-rejections=throw kills the process on any orphaned
  // promise rejection (e.g. losing-side promises in Promise.all). Log it instead.
  process.on("unhandledRejection", (reason) => {
    log.error({ action: "process.unhandled_rejection", error: reason });
  });
};

const headersHandler = (async ({ event, resolve }) => {
  const response = await resolve(event);
  const { request, url } = event;

  // Security headers
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // Clickjacking protection. The newsroom draft preview must be embeddable in the Payload
  // CMS admin's live-preview iframe, so allow only the CMS origin to frame that one route;
  // everything else stays frame-locked.
  const isNewsroomPreview = url.pathname.startsWith("/newsroom/") && url.searchParams.get("preview") === "1";
  if (isNewsroomPreview) {
    const cms = PUBLIC_CMS_URL?.trim();
    response.headers.append("Content-Security-Policy", `frame-ancestors 'self'${cms ? ` ${cms}` : ""}`);
  } else {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.append("Content-Security-Policy", "frame-ancestors 'none'");
  }

  // Cross-Origin policies
  // COEP intentionally unsafe-none: tightening would require all cross-origin
  // resources (textures.minecraft.net, nmsr.nickac.dev, etc.) to send CORP
  // headers, which they don't control.
  response.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");

  // Legacy XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const isCupcake = host.includes("cupcake.shiiyu.moe");

  if (isCupcake) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}) satisfies Handle;

const betterAuthHandler: Handle = async ({ event, resolve }) => {
  const startedAt = performance.now();
  const session = await auth.api.getSession({ headers: event.request.headers });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
    // Reuses the session resolved above, so no second lookup (unlike evlog's createAuthMiddleware).
    identifyUser(event.locals.log, session, {
      fields: ["id", "name"],
      session: false,
      extend: ({ user }) => ({ role: user.role })
    });
  }
  event.locals.log.set({ auth: { resolvedIn: Math.round(performance.now() - startedAt), identified: !!session } });

  return svelteKitHandler({ event, resolve, auth, building });
};

const protectedHandler = (async ({ event, resolve }) => {
  const { locals, route } = event;
  if (!locals.user) {
    if (route.id?.includes(protectedRouteGroupName)) {
      locals.log.set({ redirect: { to: signInPath, reason: "unauthenticated" } });
      return redirectTo(signInPath);
    }
  }
  if (locals.user) {
    const roles = (locals.user.role ? locals.user.role.split(",") : []) as UserRole[];
    const isAdmin = roles.includes(UserRole.Admin);
    if (route.id?.includes(protectedAdminRouteGroupName) && !isAdmin) {
      locals.log.set({ redirect: { to: "/dashboard", reason: "missing_admin_role" } });
      return redirectTo("/dashboard");
    }
  }
  if (locals.user && locals.session) {
    if (route.id?.startsWith(signInPath)) {
      return redirectTo("/dashboard");
    }
  }
  return resolve(event);
}) satisfies Handle;

export const handle = sequence(evlogHandle, betterAuthHandler, protectedHandler, headersHandler) satisfies Handle;
