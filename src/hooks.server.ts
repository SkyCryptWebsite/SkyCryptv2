import { building } from "$app/environment";
import { env as envPublic } from "$env/dynamic/public";
import { auth } from "$lib/server/auth";
import { UserRole } from "$lib/shared/roles";
import { runMigrations } from "$src/lib/server/db/migrate";
import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
import { redirect, type Handle, type ServerInit } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";

const protectedRouteGroupName = "(protected)";
const protectedAdminRouteGroupName = "(admin)";
const signInPath = "/login";

export const init: ServerInit = async () => {
  if (building) {
    console.info("Skipping migrations during build.");
    return;
  }
  await runMigrations();
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
    const cms = envPublic.PUBLIC_CMS_URL?.trim();
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

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();

const betterAuthHandler: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({ headers: event.request.headers });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

const protectedHandler = (async ({ event, resolve }) => {
  const { locals, route } = event;
  if (!locals.user) {
    if (route.id?.includes(protectedRouteGroupName)) {
      console.info("Redirecting to sign-in page as user is not authenticated.");
      redirect(307, signInPath);
    }
  }
  if (locals.user) {
    const roles = (locals.user.role ? locals.user.role.split(",") : []) as UserRole[];
    const isAdmin = roles.includes(UserRole.Admin);
    if (route.id?.includes(protectedAdminRouteGroupName) && !isAdmin) {
      console.info("Redirecting to dashboard as user lacks admin role.");
      redirect(307, "/dashboard");
    }
  }
  if (locals.user && locals.session) {
    if (route.id?.startsWith(signInPath)) {
      redirect(307, "/dashboard");
    }
  }
  return resolve(event);
}) satisfies Handle;

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle(), betterAuthHandler, protectedHandler, headersHandler) satisfies Handle;
