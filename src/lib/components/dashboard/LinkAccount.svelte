<script lang="ts">
  import { resolve } from "$app/paths";
  import { authClient } from "$lib/shared/auth-client";
  import { Button } from "$ui/button";
  import { Spinner } from "$ui/spinner";
  import { toast } from "svelte-sonner";

  let {
    provider,
    reconnect = false,
    callbackURL = "/dashboard"
  }: {
    provider: "patreon" | "mc-id";
    reconnect?: boolean;
    callbackURL?: "/dashboard" | "/dashboard/donator-perks";
  } = $props();
  let pending = $state(false);
  const label = $derived(provider === "patreon" ? "Patreon" : "Minecraft");

  async function link() {
    pending = true;
    try {
      const result = await authClient.linkSocial({
        provider,
        callbackURL: resolve(callbackURL) + (provider === "patreon" ? "?linked=patreon" : ""),
        errorCallbackURL: resolve(callbackURL)
      });
      if (result.error) toast.error(result.error.message ?? `Unable to link ${label}.`);
    } catch {
      toast.error(`Unable to connect to ${label}. Please try again.`);
    } finally {
      pending = false;
    }
  }
</script>

<Button variant="outline" class="w-full sm:w-auto" onclick={link} disabled={pending} aria-busy={pending}>
  {#if pending}
    <Spinner data-icon="inline-start" />
  {/if}
  {pending ? "Connecting…" : reconnect ? "Reconnect MC-ID" : `Link ${label}`}
</Button>
