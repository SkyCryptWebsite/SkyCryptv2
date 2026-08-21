import { building, dev } from "$app/environment";
import { getRequestEvent } from "$app/server";
import { env as envPrivate } from "$env/dynamic/private";
import { env as envPublic } from "$env/dynamic/public";
import { db } from "$lib/server/db";
import { apiKey } from "@better-auth/api-key";
import type { BetterAuthPlugin } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { admin, genericOAuth, patreon } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";

const {
  BETTER_AUTH_SECRET,
  ORIGIN,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  ADDRESS_HEADER,
  MC_ID_CLIENT_ID,
  MC_ID_CLIENT_SECRET,
  PATREON_CLIENT_ID,
  PATREON_CLIENT_SECRET,
  DISCORD_WHITELIST
} = envPrivate;
const { PUBLIC_BASE_URL } = envPublic;

const BUILD_TIME_AUTH_SECRET = "build-time-placeholder-secret-for-sveltekit-build";
const BUILD_TIME_BASE_URL = "http://localhost:3000";

// Uncomment when running `pn auth:schema`
// const building = false; // Placeholder since we can't import from $app/environment in this file
// const dev = false; // Placeholder since we can't import from $app/environment in this file

function getBetterAuthSecret() {
  if (BETTER_AUTH_SECRET) return BETTER_AUTH_SECRET;
  if (building) return BUILD_TIME_AUTH_SECRET;

  throw new Error("BETTER_AUTH_SECRET is required at runtime.");
}

function getBaseURL() {
  if (PUBLIC_BASE_URL) return PUBLIC_BASE_URL;
  if (ORIGIN) return ORIGIN;
  if (building) return BUILD_TIME_BASE_URL;

  throw new Error("PUBLIC_BASE_URL or ORIGIN is required at runtime.");
}

const getWhitelist = () => {
  if (!DISCORD_WHITELIST) return [];
  return DISCORD_WHITELIST.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
};

const baseURL = getBaseURL();

// Dynamically import the openAPI plugin only in development to avoid including it in the production bundle
const openAPIPlugin: BetterAuthPlugin | null = dev
  ? await (async () => {
      const { openAPI } = await import("better-auth/plugins");
      return openAPI();
    })()
  : null;

export const auth = betterAuth({
  appName: "SkyCrypt",
  baseURL,
  secret: getBetterAuthSecret(),
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: false },
  socialProviders: {
    discord: {
      clientId: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      disableDefaultScope: true,
      disableSignUp: false,
      scope: ["identify"],
      enabled: true,
      prompt: "consent",
      mapProfileToUser: (profile) => ({
        email: profile.id + "@discord.placeholder.local"
      })
    }
  },
  // Better Auth lifecycle database hooks
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const whitelist = getWhitelist();

          // Fallback if whitelist environment variable isn't configured yet
          if (whitelist.length === 0) {
            throw new Error("Access Denied: Registrations are currently locked.");
          }

          // Extract the Discord ID out of the generated placeholder email address
          const discordId = user.email.split("@")[0];

          if (!whitelist.includes(discordId)) {
            // Throwing an error here stops the database transaction entirely
            throw new Error("Access Denied: Your Discord account is not whitelisted.");
          }

          return { data: user };
        }
      }
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
      strategy: "jwe"
    },
    storeSessionInDatabase: true
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: [(ADDRESS_HEADER || "x-forwarded-for").toLowerCase()]
    },
    useSecureCookies: !dev
  },
  plugins: [
    apiKey({
      defaultPrefix: "sky_"
    }),
    admin(),
    genericOAuth({
      config: [
        {
          providerId: "mc-id",
          clientId: MC_ID_CLIENT_ID,
          clientSecret: MC_ID_CLIENT_SECRET,
          discoveryUrl: "https://mc-id.com/.well-known/openid-configuration",
          scopes: ["profile", "connections"],
          pkce: true,
          disableSignUp: true,
          disableImplicitSignUp: true,
          requireIssuerValidation: true
        },
        patreon({
          clientId: PATREON_CLIENT_ID,
          clientSecret: PATREON_CLIENT_SECRET,
          pkce: true,
          disableSignUp: true,
          disableImplicitSignUp: true,
          scopes: ["identity.memberships"]
        })
      ]
    }),
    ...(openAPIPlugin ? [openAPIPlugin] : []), // Conditionally include the openAPI plugin only in development
    sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
  ]
});
