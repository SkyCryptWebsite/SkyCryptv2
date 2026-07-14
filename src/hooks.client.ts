import { dev } from "$app/environment";
import { env } from "$env/dynamic/public";
import * as Sentry from "@sentry/sveltekit";
import {
  browserTracingIntegration,
  consoleLoggingIntegration,
  contextLinesIntegration,
  extraErrorDataIntegration,
  handleErrorWithSentry,
  httpClientIntegration
} from "@sentry/sveltekit";

const { PUBLIC_SENTRY_DSN } = env;

Sentry.init({
  dsn: PUBLIC_SENTRY_DSN,
  tunnel: "/api/tunnel",

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable debug
  tracesSampleRate: 0.3,

  integrations: [
    browserTracingIntegration(),
    httpClientIntegration(),
    contextLinesIntegration(),
    extraErrorDataIntegration(),
    consoleLoggingIntegration()
  ],
  enabled: !dev,
  environment: dev ? "development" : "production"
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
