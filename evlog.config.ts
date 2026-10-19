import { defineEvlog } from "evlog";
import { createDefaultEnrichers } from "evlog/enrichers";

// Drains (HyperDX / fs) are attached in src/hooks.server.ts because they read $app/env.
export default defineEvlog({
  service: "skycrypt-frontend",
  // Keep the text tree in production too so the Dokploy Logs tab stays readable (JSON is the default there).
  pretty: true,
  enrich: createDefaultEnrichers()
});
