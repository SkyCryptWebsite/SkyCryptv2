<script lang="ts">
  import { resolve } from "$app/paths";
  import { authClient } from "$lib/shared/auth-client";
  import * as Avatar from "$ui/avatar";
  import * as DropdownMenu from "$ui/dropdown-menu";
  import * as Sidebar from "$ui/sidebar";
  import { Skeleton } from "$ui/skeleton";
  import { Spinner } from "$ui/spinner";
  import type { Icon as IconType } from "@lucide/svelte";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import HeartIcon from "@lucide/svelte/icons/heart";
  import HouseIcon from "@lucide/svelte/icons/house";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import { toast } from "svelte-sonner";
  import { getDashboard } from "./dashboard.remote";

  const sidebar = Sidebar.useSidebar();
  let signingOut = $state(false);

  async function signOut() {
    signingOut = true;
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message ?? "Unable to sign out.");
      window.location.assign(resolve("/login"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
      signingOut = false;
    }
  }

  const BASE_URL_DASHBOARD = "/dashboard";

  const items = [
    {
      title: "Home",
      url: BASE_URL_DASHBOARD,
      icon: HouseIcon
    },
    {
      title: "Settings",
      url: BASE_URL_DASHBOARD + "/settings",
      icon: SettingsIcon
    },
    {
      title: "Donator Perks",
      url: BASE_URL_DASHBOARD + "/donator-perks",
      icon: HeartIcon
    }
  ] satisfies { title: string; url: string; icon: typeof IconType }[];
</script>

<Sidebar.Root class="top-12 h-[calc(100svh-3rem)] bg-sidebar standard:glass standard:bg-transparent" collapsible="icon">
  <Sidebar.Content class="">
    <Sidebar.Group>
      <Sidebar.GroupLabel>Dashboard</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each items as item (item.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                variant="outline"
                class="my-1 bg-transparent transition-[scale] hover:scale-95 hover:bg-transparent hover:shadow-border active:bg-transparent">
                {#snippet child({ props })}
                  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                  <a href={item.url} {...props}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer>
    <svelte:boundary>
      {const { user } = $derived(await getDashboard())}
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              class="transition-[scale] duration-150 ease-out interact:scale-95 interact:bg-transparent"
              disabled={signingOut}>
              {#snippet child({ props })}
                <Sidebar.MenuButton
                  {...props}
                  size="lg"
                  aria-label={`Account menu for ${user.name}`}
                  aria-busy={signingOut}>
                  <Avatar.Root class="size-8 shrink-0 rounded-xl">
                    {#if user.image}
                      <Avatar.Image src={user.image} alt="" />
                    {/if}
                    <Avatar.Fallback>{user.name.trim().slice(0, 2).toUpperCase() || "SC"}</Avatar.Fallback>
                  </Avatar.Root>
                  <div class="grid min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                    <span class="truncate font-medium">{user.name}</span>
                  </div>
                  <ChevronsUpDownIcon class="ml-auto group-data-[collapsible=icon]:hidden" />
                </Sidebar.MenuButton>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              side={sidebar.isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
              class="min-w-56">
              <DropdownMenu.Group>
                <DropdownMenu.Item disabled={signingOut} onSelect={() => void signOut()}>
                  {#if signingOut}
                    <Spinner />
                  {:else}
                    <LogOutIcon />
                  {/if}
                  {signingOut ? "Signing out…" : "Sign out"}
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
      {#snippet pending()}
        <Skeleton class="h-14 w-full" role="status" aria-label="Loading account menu" />
      {/snippet}
      {#snippet failed(_error)}
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a {...props} href={resolve("/dashboard/settings")}><SettingsIcon /><span>Account settings</span></a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      {/snippet}
    </svelte:boundary>
  </Sidebar.Footer>
</Sidebar.Root>
