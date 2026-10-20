<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import * as Avatar from "$ui/avatar";
  import * as DropdownMenu from "$ui/dropdown-menu";
  import * as Sidebar from "$ui/sidebar";
  import { Skeleton } from "$ui/skeleton";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import { roleLabels } from "#lib/shared/roles";
  import { getOverview, getStaffContext } from "./admin.remote";
  import { ADMIN_BASE, navGroups } from "./nav";

  const sidebar = Sidebar.useSidebar();
  const isActive = (url: string) =>
    url === ADMIN_BASE ? page.url.pathname === url : page.url.pathname.startsWith(url);
</script>

<Sidebar.Root variant="inset" collapsible="icon" class="top-12 h-[calc(100svh-3rem)]">
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg">
          {#snippet child({ props })}
            <a href={resolve("admin-dashboard")} {...props}>
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldIcon class="size-4" />
              </div>
              <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-semibold">SkyCrypt</span>
                <span class="truncate text-xs text-muted-foreground">Admin dashboard</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>

  <Sidebar.Content>
    <svelte:boundary>
      {const staffQuery = getStaffContext()}
      {const overviewQuery = getOverview()}
      {const { permissions } = $derived(await staffQuery)}
      {const overview = $derived(await overviewQuery)}
      {#each navGroups as group (group.label)}
        {const items = $derived(group.items.filter((item) => !("requires" in item) || permissions[item.requires]))}
        {#if items.length}
          <Sidebar.Group>
            {#if group.label}<Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>{/if}
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                {#each items as item (item.url)}
                  {const count = $derived("pending" in item ? overview[item.pending] : 0)}
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton isActive={isActive(item.url)} tooltipContent={item.title}>
                      {#snippet child({ props })}
                        <!-- eslint-disable svelte/no-navigation-without-resolve -->
                        <a href={item.url} aria-current={isActive(item.url) ? "page" : undefined} {...props}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                        <!-- eslint-enable svelte/no-navigation-without-resolve -->
                      {/snippet}
                    </Sidebar.MenuButton>
                    {#if count}
                      <Sidebar.MenuBadge class="tabular-nums">
                        {count}<span class="sr-only"> pending</span>
                      </Sidebar.MenuBadge>
                    {/if}
                  </Sidebar.MenuItem>
                {/each}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        {/if}
      {/each}
      {#snippet pending()}
        <div class="flex flex-col gap-2 p-2" role="status" aria-label="Loading navigation">
          {#each Array.from({ length: 6 }, (_, index) => index) as index (index)}
            <Sidebar.MenuSkeleton showIcon />
          {/each}
        </div>
      {/snippet}
    </svelte:boundary>
  </Sidebar.Content>

  <Sidebar.Footer>
    <svelte:boundary>
      {const { user } = $derived(await getStaffContext())}
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              {#snippet child({ props })}
                <Sidebar.MenuButton
                  {...props}
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar.Root class="size-8 rounded-lg">
                    {#if user.image}<Avatar.Image src={user.image} alt="" />{/if}
                    <Avatar.Fallback class="rounded-lg">{user.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                  </Avatar.Root>
                  <div class="grid flex-1 text-start text-sm leading-tight">
                    <span class="truncate font-medium">{user.name}</span>
                    <span class="truncate text-xs text-muted-foreground">{roleLabels[user.role]}</span>
                  </div>
                  <ChevronsUpDownIcon class="ms-auto size-4" />
                </Sidebar.MenuButton>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              side={sidebar.isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
              class="min-w-56 rounded-lg">
              <DropdownMenu.Item>
                {#snippet child({ props })}
                  <a {...props} href={resolve("dashboard")}><ArrowLeftIcon />Back to your dashboard</a>
                {/snippet}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
      {#snippet pending()}
        <Skeleton class="h-12 w-full" role="status" aria-label="Loading account" />
      {/snippet}
    </svelte:boundary>
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
