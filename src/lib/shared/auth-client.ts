import { env } from "$env/dynamic/public";
import type { auth } from "$lib/server/auth";
import { apiKeyClient } from "@better-auth/api-key/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
  baseURL: env.PUBLIC_ORIGIN,
  sessionOptions: {
    refetchInterval: 60, // Polling interval in seconds. Set to 0 to disable
    refetchOnWindowFocus: true,
    refetchWhenOffline: false
  },
  plugins: [apiKeyClient(), adminClient(), organizationClient(), customSessionClient<typeof auth>()]
});
