import { dev } from "$app/env";
import { PUBLIC_SENTRY_DSN } from "$app/env/public";
import * as Sentry from "@sentry/sveltekit";
import { consoleLoggingIntegration, contextLinesIntegration, extraErrorDataIntegration } from "@sentry/sveltekit";

Sentry.init({
  dsn: PUBLIC_SENTRY_DSN,

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

  tracesSampleRate: 0.3,
  integrations: [contextLinesIntegration(), extraErrorDataIntegration(), consoleLoggingIntegration()],

  // Disable Sentry during development
  enabled: !dev,
  environment: dev ? "development" : "production"
});

// Node 24's default --unhandled-rejections=throw will kill the process on any
// orphaned promise rejection (e.g. losing-side promises in Promise.all when
// one rejects first). Log and report so we get visibility, but don't crash.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  Sentry.captureException(reason);
});
