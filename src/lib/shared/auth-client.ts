import { PUBLIC_ORIGIN } from "$app/env/public";
import { apiKeyClient } from "@better-auth/api-key/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";
import { ac, roles } from "#lib/shared/roles";

export const authClient = createAuthClient({
  baseURL: PUBLIC_ORIGIN,
  sessionOptions: {
    refetchInterval: 60, // Polling interval in seconds. Set to 0 to disable
    refetchOnWindowFocus: true,
    refetchWhenOffline: false
  },
  plugins: [apiKeyClient(), adminClient({ ac, roles }), organizationClient()]
});
