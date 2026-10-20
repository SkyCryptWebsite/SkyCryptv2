<script lang="ts">
  import { resolve } from "$app/paths";
  import { syncMinecraftAccounts } from "$routes/(protected)/dashboard/minecraft.remote";
  import { authClient } from "$src/lib/shared/auth-client";
  import * as Avatar from "$ui/avatar";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Empty from "$ui/empty";
  import LinkIcon from "@lucide/svelte/icons/link";
  import PickaxeIcon from "@lucide/svelte/icons/pickaxe";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import SvelteSeo from "svelte-seo";
  import { toast } from "svelte-sonner";
  import { getDashboard } from "./dashboard.remote";
  import MinecraftAccounts from "./minecraft-accounts.svelte";

  const dashboard = $derived(await getDashboard());
  const minecraft = $derived(dashboard.accounts.some((account) => account.providerId === "mc-id"));

  const discord = $derived(dashboard.discord);

  let needsReconnect = $state(false);
  async function sync() {
    try {
      const result = await syncMinecraftAccounts();
      needsReconnect = result.reconnect;
      if (result.reconnect) toast.error("Reconnect MC-ID to renew access, then sync your accounts again.");
      else toast.success("Minecraft accounts synced.");
    } catch (error) {
      needsReconnect = true;
      toast.error(error instanceof Error ? error.message : "Unable to sync Minecraft accounts.");
    }
  }

  function linkAccount() {
    toast.promise(
      authClient.linkSocial({
        provider: "mc-id",
        callbackURL: resolve("dashboard"),
        errorCallbackURL: resolve("dashboard")
      }),
      {
        loading: "Reconnecting MC-ID…",
        success: "MC-ID reconnected.",
        error: "Unable to reconnect MC-ID. Please try again."
      }
    );
  }
</script>

<SvelteSeo title="Dashboard | SkyCrypt" noindex={true} nofollow={true} />

<div class="mx-auto flex w-full max-w-xl flex-col gap-y-4">
  <div class="relative isolate flex w-full flex-col overflow-clip rounded-4xl border glass glass-bg-card">
    <div class="relative">
      {#if discord?.bannerHash}
        <Avatar.Root
          class="pointer-events-none relative z-20 aspect-video size-full max-h-64 overflow-clip rounded-none select-none after:rounded-none after:border-none">
          <Avatar.Image
            class="size-full rounded-none object-cover"
            src="https://cdn.discordapp.com/banners/{discord?.discordUserId}/{discord?.bannerHash}?size=1024&animated=true"
            alt="User banner" />
        </Avatar.Root>
      {:else}
        <div class="relative z-20 aspect-video size-full max-h-64 bg-black/50"></div>
      {/if}

      <div class="pointer-events-none absolute bottom-0 left-4 isolate z-30 translate-y-16 select-none">
        {#if discord?.avatarDecorationHash}
          <Avatar.Root
            class="absolute -inset-3 z-10 block size-38 origin-center overflow-visible bg-transparent after:border-none">
            <Avatar.Image
              loading="lazy"
              class="size-full origin-center overflow-visible after:border-none"
              src="https://cdn.discordapp.com/avatar-decoration-presets/{discord?.avatarDecorationHash}"
              alt="User avatar" />
          </Avatar.Root>
        {/if}

        <Avatar.Root class="relative size-32 overflow-visible bg-transparent after:border-none ">
          <Avatar.Root class="absolute z-0 size-32 overflow-hidden rounded-full bg-card ">
            <Avatar.Image
              loading="lazy"
              src="https://cdn.discordapp.com/avatars/{discord?.discordUserId}/{discord?.avatarHash}?size=512&animated=true"
              alt="User avatar" />

            <Avatar.Fallback>{dashboard.user.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
        </Avatar.Root>
      </div>
    </div>
    <div class="relative mt-16 flex flex-row items-center gap-4 p-4">
      <div class="flex flex-col gap-1 break-all">
        <div class="flex flex-row items-center-safe gap-2">
          <p class="text-2xl font-semibold">{dashboard.user.name}</p>
          {#if discord?.primaryGuild && discord?.primaryGuild?.identity_enabled}
            <Badge variant="outline" class="px-2 py-3.5 text-base">
              <Avatar.Root class="size-4 rounded-none after:rounded-none after:border-none">
                <Avatar.Image
                  src="https://cdn.discordapp.com/guild-tag-badges/{discord?.primaryGuild?.identity_guild_id}/{discord
                    ?.primaryGuild?.badge}"
                  alt="Badge icon" />
                <Avatar.Fallback>{discord.primaryGuild?.tag?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              {discord.primaryGuild?.tag}
            </Badge>
          {/if}
        </div>

        <span class="text-sm">{discord?.username}</span>

        <div class="flex flex-row items-center gap-1">
          <p class="text-sm text-muted-foreground">{discord?.discordUserId}</p>
        </div>
      </div>
    </div>
  </div>

  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <Card.Title>Connected Minecraft accounts</Card.Title>
      <Card.Description>
        Manage your Minecraft accounts on
        <Button class="h-auto p-0" variant="link" href="https://mc-id.com/dashboard/connections/minecraft">
          MC-ID
        </Button>
      </Card.Description>
    </Card.Header>

    <Card.Content>
      {#if minecraft}
        <div class="contents space-y-4">
          <div class="flex flex-wrap items-center gap-2 px-4">
            {#if needsReconnect}
              <Button size="xs" variant="outline" onclick={linkAccount}>
                <LinkIcon class="size-4" />
                Reconnect MC-ID
              </Button>
            {:else}
              <Button
                variant="outline"
                onclick={sync}
                disabled={!!syncMinecraftAccounts.pending}
                aria-busy={!!syncMinecraftAccounts.pending}>
                <RefreshCwIcon
                  data-pending={!!syncMinecraftAccounts.pending}
                  class="data-[pending=true]:animate-spin" />
                {syncMinecraftAccounts.pending ? "Syncing…" : "Sync"}
              </Button>
            {/if}
          </div>
          <MinecraftAccounts />
        </div>
      {:else}
        <Empty.Root class="border">
          <Empty.Header>
            <Empty.Media variant="icon" class="border bg-transparent">
              <PickaxeIcon />
            </Empty.Media>
            <Empty.Title>No accounts</Empty.Title>
            <Empty.Description>
              Connect your Minecraft account(s) with <Button
                variant="link"
                target="_blank"
                href="https://mc-id.com"
                class="h-auto min-h-0! p-0">MC-ID</Button> to unlock profile specific features and benefits.
            </Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button onclick={linkAccount}>Connect Account</Button>
          </Empty.Content>
        </Empty.Root>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
