import { defineEnvVars } from "@sveltejs/kit/env";

const schema = (input: string | undefined) => input ?? "";

export const variables = defineEnvVars({
  PUBLIC_CMS_URL: { public: true, schema },
  PUBLIC_BASE_URL: { public: true, schema },
  PUBLIC_DISCORD_INVITE: { public: true, schema },
  PUBLIC_PATREON: { public: true, schema },
  PUBLIC_PATREON_ANY_EMOJI_CENTS: { public: true, schema },
  PUBLIC_PATREON_COLORED_HEART_CENTS: { public: true, schema },
  CMS_PREVIEW_TOKEN: { schema },
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
  CMS_API_TOKEN: { schema },
  DISCORD_CLIENT_ID: { schema },
  DISCORD_CLIENT_SECRET: { schema },
  DISCORD_WHITELIST: { schema },
  MC_ID_CLIENT_ID: { schema },
  MC_ID_CLIENT_SECRET: { schema },
  ORIGIN: {
    schema,
    description: "The app origin (base URL), e.g. `http://localhost:5173`."
  },
  SERVER_API_TOKEN: { schema },
  SERVER_CMS_API_URL: { schema },
  PATREON_CLIENT_ID: { schema },
  PATREON_CLIENT_SECRET: { schema },
  PATREON_CREATOR_ACCESS_TOKEN: { schema },
  PATREON_CREATOR_REFRESH_TOKEN: { schema },
  PATREON_CAMPAIGN_ID: { schema },
  DATABASE_URL: { schema },
  TURNSTILE_SECRET_KEY: { schema },
  PUBLIC_TURNSTILE_SITE_KEY: { public: true, schema },
  PUBLIC_COMMIT_HASH: { public: true, static: true }
});
