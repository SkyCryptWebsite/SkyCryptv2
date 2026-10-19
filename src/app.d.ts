import type { RequestLogger } from "evlog";
import type { auth } from "#lib/server/auth.js";
import type { DiscordProfileAssets } from "#lib/server/discord-profile.js";
import type { McIdLink, McIdProfile } from "#lib/server/minecraft-accounts.js";

type AuthSession = typeof auth.$Infer.Session;

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  const __NPM_PACKAGE_VERSION__: string;
  const __PRERENDER_VERSION__: string;

  namespace App {
    // interface Error {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
    namespace Superforms {
      type Message = { type: "error" | "success"; text: string };
    }

    interface Locals {
      log: RequestLogger;
      pendingDiscordProfile?: DiscordProfileAssets;
      pendingMcIdProfile?: McIdProfile;
      pendingMcIdLink?: McIdLink;
      user?: AuthSession["user"];
      session?: AuthSession["session"];
    }
  }
}

export {};
