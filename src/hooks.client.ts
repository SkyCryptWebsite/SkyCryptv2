import { dev } from "$app/env";
import { PUBLIC_SENTRY_DSN } from "$app/env/public";
import * as Sentry from "@sentry/sveltekit";
import {
  browserTracingIntegration,
  consoleLoggingIntegration,
  contextLinesIntegration,
  extraErrorDataIntegration,
  handleErrorWithSentry,
  httpClientIntegration
} from "@sentry/sveltekit";

Sentry.init({
  dsn: PUBLIC_SENTRY_DSN,
  tunnel: "/api/tunnel",

  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: {
      request: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
      response: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] }
    },
    httpBodies: [],
    urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    graphQL: { document: false, variables: false }
  },

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
