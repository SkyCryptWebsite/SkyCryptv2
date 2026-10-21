import { dev } from "$app/env";
import type { HandleClientError } from "@sveltejs/kit/hooks";
import { initLog, log } from "evlog/client";

// Warnings and errors go to /api/client-logs, which forwards them to the same drains as server logs.
initLog({
  service: "skycrypt-web",
  minLevel: dev ? "debug" : "warn",
  transport: { enabled: !dev, endpoint: "/api/client-logs" }
});

export const handleError: HandleClientError = ({ kind, error, event }) => {
  if (kind !== "unknown") return;
  log.error({ action: "client.unhandled_error", path: event.url.pathname, error });
};

window.addEventListener("unhandledrejection", (e) => {
  log.error({ action: "client.unhandled_rejection", path: location.pathname, error: e.reason });
});

window.addEventListener("error", (e) => {
  // Cross-origin script failures (extensions, third-party scripts) carry no usable info.
  if (!e.filename || e.message === "Script error.") return;
  log.error({ action: "client.window_error", path: location.pathname, message: e.message, file: e.filename });
});
