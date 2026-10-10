import type { auth } from "$lib/server/auth";
import type { DiscordProfileAssets } from "$lib/server/discord-profile";
import type { McIdLink, McIdProfile } from "$lib/server/minecraft-accounts";

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
      pendingDiscordProfile?: DiscordProfileAssets;
      pendingMcIdProfile?: McIdProfile;
      pendingMcIdLink?: McIdLink;
      user?: AuthSession["user"];
      session?: AuthSession["session"];
    }
  }
}

export {};
