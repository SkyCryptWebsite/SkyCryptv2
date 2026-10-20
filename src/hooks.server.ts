import { building, dev } from "$app/env";
import { HYPERDX_API_KEY, HYPERDX_OTLP_ENDPOINT } from "$app/env/private";
import { PUBLIC_RELEASE_CHANNEL } from "$app/env/public";
import { runMigrations } from "$src/lib/server/db/migrate";
import { sequence, type Handle, type HandleServerError, type ServerInit } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { initLogger, log, toLoggerConfig, toMiddlewareOptions, type DrainContext } from "evlog";
import { identifyUser } from "evlog/better-auth";
import { createFsDrain } from "evlog/fs";
import { createHyperDXDrain } from "evlog/hyperdx";
import { createDrainPipeline } from "evlog/pipeline";
import { createEvlogHooks } from "evlog/sveltekit";
import { auth } from "#lib/server/auth";
import { can } from "#lib/shared/roles";
import evlogConfig from "../evlog.config";

// HyperDX in production (batched, retried), local NDJSON in dev for `evlog logs`. Stdout always stays on.
const hyperdxDrain = HYPERDX_OTLP_ENDPOINT
  ? createDrainPipeline<DrainContext>({
      batch: { size: 100, intervalMs: 5000 },
      retry: { maxAttempts: 3 },
      onDropped: (events, error) =>
        log.warn("evlog", `Dropped ${events.length} events: ${error?.message ?? "buffer full"}`)
    })(createHyperDXDrain({ endpoint: HYPERDX_OTLP_ENDPOINT, apiKey: HYPERDX_API_KEY }))
  : undefined;
const drain = hyperdxDrain ?? (dev ? createFsDrain({ maxFiles: 7 }) : undefined);

// Stable keeps NODE_ENV ("production") so existing HyperDX searches still match it.
const environment = !dev && PUBLIC_RELEASE_CHANNEL === "beta" ? "beta" : undefined;

initLogger({ ...toLoggerConfig({ ...evlogConfig, environment }), drain });

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
process.on("SIGTERM", () => void hyperdxDrain?.flush());

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
  const response = await resolve(event, {
    // Body text font; without this it only starts downloading once the CSS has been parsed.
    preload: (input) =>
      input.type === "js" ||
      input.type === "css" ||
      (input.type === "font" && input.filename.endsWith("montserrat-latin-wght-normal.woff2"))
  });

  // Security headers
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // Clickjacking protection.
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.append("Content-Security-Policy", "frame-ancestors 'none'");

  // Cross-Origin policies
  // COEP intentionally unsafe-none: tightening would require all cross-origin
  // resources (textures.minecraft.net, nmsr.nickac.dev, etc.) to send CORP
  // headers, which they don't control.
  response.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");

  // Legacy XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

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
    // Coarse gate only; every admin remote function checks its own permission and staff rank.
    if (route.id?.includes(protectedAdminRouteGroupName) && !can(locals.user.role, { dashboard: ["view"] })) {
      locals.log.set({ redirect: { to: "/dashboard", reason: "missing_staff_role" } });
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
