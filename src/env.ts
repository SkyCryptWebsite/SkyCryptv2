import { defineEnvVars } from "@sveltejs/kit/env";

const schema = (input: string | undefined) => input ?? "";

export const variables = defineEnvVars({
  PUBLIC_DISCORD_INVITE: { public: true, schema },
  PUBLIC_PATREON: { public: true, schema },
  PUBLIC_PATREON_ANY_EMOJI_CENTS: { public: true, schema },
  PUBLIC_PATREON_COLORED_HEART_CENTS: { public: true, schema },
  PUBLIC_ORIGIN: { public: true, schema },
  PUBLIC_SERVER_API_URL: { public: true, schema },
  PUBLIC_UMAMI_ENABLE_HEATMAPS: { public: true, schema },
  PUBLIC_UMAMI_HOST_URL: { public: true, schema },
  PUBLIC_UMAMI_RECORDER_URL: { public: true, schema },
  PUBLIC_UMAMI_SCRIPT_URL: { public: true, schema },
  PUBLIC_UMAMI_WEBSITE_ID: { public: true, schema },
  ADDRESS_HEADER: { schema },
  BETTER_AUTH_SECRET: {
    schema,
    description:
      "Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation)."
  },
  DISCORD_CLIENT_ID: { schema },
  DISCORD_CLIENT_SECRET: { schema },
  MC_ID_CLIENT_ID: { schema },
  MC_ID_CLIENT_SECRET: { schema },
  ORIGIN: {
    schema,
    description: "The app origin (base URL), e.g. `http://localhost:5173`."
  },
  SERVER_API_TOKEN: { schema },
  PATREON_CLIENT_ID: { schema },
  PATREON_CLIENT_SECRET: { schema },
  PATREON_CREATOR_ACCESS_TOKEN: { schema },
  PATREON_CREATOR_REFRESH_TOKEN: { schema },
  PATREON_CAMPAIGN_ID: { schema },
  DATABASE_URL: { schema },
  TURNSTILE_SECRET_KEY: { schema },
  HYPERDX_OTLP_ENDPOINT: {
    schema,
    description: "Base URL of the HyperDX OTLP HTTP intake (without `/v1/logs`). Logs only go to stdout when empty."
  },
  HYPERDX_API_KEY: { schema, description: "HyperDX ingestion API key (Team Settings → API Keys)." },
  PUBLIC_TURNSTILE_SITE_KEY: { public: true, schema },
  R2_ACCOUNT_ID: { schema, description: "Cloudflare account ID that owns the media bucket." },
  R2_ACCESS_KEY_ID: { schema, description: "R2 API token access key with read and write access to `R2_BUCKET`." },
  R2_SECRET_ACCESS_KEY: { schema },
  R2_BUCKET: { schema, description: "R2 bucket that stores newsroom uploads." },
  PUBLIC_MEDIA_URL: {
    public: true,
    schema,
    description: "Public URL the bucket is served from (an R2 custom domain), e.g. `https://media.shiiyu.moe`."
  },
  PUBLIC_COMMIT_HASH: { public: true, static: true },
  PUBLIC_RELEASE_CHANNEL: {
    public: true,
    static: true,
    schema: (input: string | undefined) => (input === "beta" ? "beta" : "stable"),
    description:
      "`beta` for builds from `dev`, `stable` otherwise. nginx serves the beta build to visitors with a `beta=true` cookie."
  }
});
