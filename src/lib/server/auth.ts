import { building, dev } from "$app/env";
import {
  ADDRESS_HEADER,
  BETTER_AUTH_SECRET,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_WHITELIST,
  MC_ID_CLIENT_ID,
  MC_ID_CLIENT_SECRET,
  ORIGIN,
  PATREON_CLIENT_ID,
  PATREON_CLIENT_SECRET,
  TURNSTILE_SECRET_KEY
} from "$app/env/private";
import { PUBLIC_BASE_URL } from "$app/env/public";
import { getRequestEvent } from "$app/server";
import { apiKey } from "@better-auth/api-key";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { admin, customSession, genericOAuth, patreon } from "better-auth/plugins";
import { captcha } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { log } from "evlog";
import { db } from "#lib/server/db/index.js";
import { getDiscordProfile, parseDiscordProfile, syncDiscordProfile } from "#lib/server/discord-profile.js";
import {
  fetchMcIdProfile,
  getStoredMinecraftAccounts,
  parseMcIdProfile,
  storeMinecraftAccounts,
  type McIdLink
} from "#lib/server/minecraft-accounts.js";
import { ac, roles } from "#lib/shared/roles.js";

const BUILD_TIME_AUTH_SECRET = "build-time-placeholder-secret-for-sveltekit-build";
const BUILD_TIME_BASE_URL = "http://localhost:3000";

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

const mcIdOAuthConfig =
  MC_ID_CLIENT_ID && MC_ID_CLIENT_SECRET
    ? [
        {
          providerId: "mc-id",
          clientId: MC_ID_CLIENT_ID,
          clientSecret: MC_ID_CLIENT_SECRET,
          tokenEndpointAuth: { method: "client_secret_basic" as const },
          discoveryUrl: "https://mc-id.com/.well-known/openid-configuration",
          scopes: ["openid", "profile", "connections", "offline_access"],
          // Accounts live in userinfo; an ID token alone may omit them.
          getUserInfo: async ({ accessToken }: { accessToken?: string }) => {
            if (!accessToken) return null;
            const profile = await fetchMcIdProfile(accessToken);
            return profile
              ? { ...profile, name: profile.name ?? "", emailVerified: profile.email_verified ?? false }
              : null;
          },
          mapProfileToUser: (profile: Parameters<typeof parseMcIdProfile>[0]) => {
            const minecraft = parseMcIdProfile(profile);
            if (minecraft) getRequestEvent().locals.pendingMcIdProfile = minecraft;
            return {};
          },
          pkce: true,
          disableSignUp: true,
          disableImplicitSignUp: true
        }
      ]
    : [];

// Dynamically import the openAPI plugin only in development to avoid including it in the production bundle
const openAPIPlugin: BetterAuthPlugin | null = dev
  ? await (async () => {
      const { openAPI } = await import("better-auth/plugins");
      return openAPI();
    })()
  : null;

// Account hooks run after Better Auth has validated ownership and persisted the link.
async function queueMinecraftSync(link: McIdLink) {
  if (link.providerId !== "mc-id") return;
  const { locals } = getRequestEvent();
  if (locals.pendingMcIdProfile?.sub === link.accountId) {
    locals.pendingMcIdLink = {
      id: link.id,
      accountId: link.accountId,
      userId: link.userId,
      providerId: link.providerId
    };
  }
}

const options = {
  appName: "SkyCrypt",
  baseURL,
  secret: getBetterAuthSecret(),
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: false },
  user: {
    additionalFields: {
      developerMode: { type: "boolean", defaultValue: false, required: false }
    }
  },
  account: {
    accountLinking: {
      trustedProviders: ["patreon", "mc-id"],
      allowDifferentEmails: true
    }
  },
  socialProviders: {
    discord: {
      clientId: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      disableDefaultScope: true,
      disableSignUp: false,
      scope: ["identify"],
      enabled: true,
      prompt: "consent",
      overrideUserInfoOnSignIn: true,
      mapProfileToUser: (profile) => {
        const assets = parseDiscordProfile(profile);
        if (assets) getRequestEvent().locals.pendingDiscordProfile = assets;
        return {
          email: profile.id + "@discord.placeholder.invalid"
        };
      }
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!ctx.request) return;
      // Keys are only issued after admin approval, so browsers may not create, re-enable or replace keys themselves.
      if (["/api-key/create", "/api-key/update", "/api-key/delete"].includes(ctx.path)) {
        throw new APIError("FORBIDDEN", { message: "Request API access from the developer dashboard." });
      }
      // Admin endpoints check permissions but not staff rank, so staff act through the admin dashboard only.
      if (ctx.path.startsWith("/admin/")) {
        throw new APIError("FORBIDDEN", { message: "Use the admin dashboard." });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (!ctx.path.startsWith("/callback/")) return;
      const { locals } = getRequestEvent();
      const mcProfile = locals.pendingMcIdProfile;
      const mcLink = locals.pendingMcIdLink;
      delete locals.pendingMcIdProfile;
      delete locals.pendingMcIdLink;
      if (mcProfile && mcLink) {
        try {
          await storeMinecraftAccounts(mcLink, mcProfile);
        } catch (error) {
          log.error({ action: "auth.sync_minecraft_accounts", error });
        }
      }
      if (!ctx.context.newSession) return;
      const assets = locals.pendingDiscordProfile;
      delete locals.pendingDiscordProfile;
      if (!assets) return;

      try {
        await syncDiscordProfile(ctx.context.newSession.user.id, assets);
      } catch (error) {
        // Cosmetic data must not turn a successful sign-in into an error.
        log.error({ action: "auth.sync_discord_profile", error });
      }
    })
  },
  // Better Auth lifecycle database hooks
  databaseHooks: {
    account: {
      create: { after: queueMinecraftSync },
      update: { after: queueMinecraftSync }
    },
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
      defaultPrefix: "skycrypt_",
      enableMetadata: true,
      requireName: true,
      rateLimit: {
        enabled: true,
        maxRequests: 300,
        timeWindow: 1000 * 60 * 5 // 5 minutes
      },
      startingCharactersConfig: {
        charactersLength: 15,
        shouldStore: true
      }
    }),
    admin({ ac, roles }),
    genericOAuth({
      config: [
        ...mcIdOAuthConfig,
        patreon({
          clientId: PATREON_CLIENT_ID,
          clientSecret: PATREON_CLIENT_SECRET,
          pkce: true,
          disableSignUp: true,
          disableImplicitSignUp: true,
          scopes: ["identity", "identity[email]"]
        })
      ]
    }),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: TURNSTILE_SECRET_KEY,
      endpoints: ["/sign-in/social"]
    }),
    ...(openAPIPlugin ? [openAPIPlugin] : []) // Conditionally include the openAPI plugin only in development
  ]
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const [discordProfile, minecraftAccounts] = await Promise.all([
        getDiscordProfile(user.id),
        getStoredMinecraftAccounts(user.id)
      ]);
      return {
        user: { ...user, discordProfile, minecraftAccounts },
        session
      };
    }, options),
    sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
  ]
});
