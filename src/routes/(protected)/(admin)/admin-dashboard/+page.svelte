<script lang="ts">
  import { resolve } from "$app/paths";
  import * as Avatar from "$ui/avatar";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Empty from "$ui/empty";
  import * as Item from "$ui/item";
  import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
  import ScrollTextIcon from "@lucide/svelte/icons/scroll-text";
  import { AUDIT_ACTIONS } from "#lib/shared/admin";
  import { getOverview } from "./admin.remote";
  import { formatDateTime, formatNumber } from "./format";

  const overview = $derived(await getOverview());

  const stats = $derived([
    {
      label: "Access requests",
      value: overview.pendingApiRequests,
      detail: "Waiting for review",
      href: resolve("admin-dashboard/api-requests"),
      highlight: overview.pendingApiRequests > 0
    },
    {
      label: "Rate limit requests",
      value: overview.pendingRateLimits,
      detail: "Waiting for review",
      href: resolve("admin-dashboard/rate-limits"),
      highlight: overview.pendingRateLimits > 0
    },
    {
      label: "Active API keys",
      value: overview.keys.active,
      detail: `${formatNumber(overview.keys.total - overview.keys.active)} disabled`,
      href: resolve("admin-dashboard/api-keys"),
      highlight: false
    },
    {
      label: "Users",
      value: overview.users.total,
      detail: `${formatNumber(overview.users.staff)} staff · ${formatNumber(overview.users.banned)} banned`,
      href: resolve("admin-dashboard/users"),
      highlight: false
    }
  ]);
</script>

<svelte:head>
  <title>Overview | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col gap-1">
  <h1 class="text-2xl font-semibold tracking-tight">Overview</h1>
  <p class="text-sm text-muted-foreground">What needs attention across SkyCrypt.</p>
</div>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {#each stats as stat (stat.label)}
    <Card.Root class="@container/card">
      <Card.Header>
        <Card.Description>{stat.label}</Card.Description>
        <Card.Title class="text-3xl font-semibold tabular-nums">{formatNumber(stat.value)}</Card.Title>
        {#if stat.highlight}
          <Card.Action><Badge variant="secondary">Needs review</Badge></Card.Action>
        {/if}
      </Card.Header>
      <Card.Footer class="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{stat.detail}</span>
        <Button variant="ghost" size="icon-sm" href={stat.href} aria-label="Open {stat.label.toLowerCase()}">
          <ArrowRightIcon />
        </Button>
      </Card.Footer>
    </Card.Root>
  {/each}
</div>

{#if overview.recent}
  <Card.Root>
    <Card.Header>
      <Card.Title>Recent staff activity</Card.Title>
      <Card.Description>The latest decisions from the audit log.</Card.Description>
      <Card.Action>
        <Button variant="outline" size="sm" href={resolve("admin-dashboard/audit-log")}>View all</Button>
      </Card.Action>
    </Card.Header>
    <Card.Content>
      {#if overview.recent.length}
        <Item.Group>
          {#each overview.recent as entry (entry.id)}
            <Item.Root size="sm" class="px-0">
              <Item.Media>
                <Avatar.Root class="size-8">
                  <Avatar.Fallback class="text-xs"
                    >{(entry.actorName ?? "?").slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar.Root>
              </Item.Media>
              <Item.Content>
                <Item.Title class="font-normal">
                  <span class="font-medium">{entry.actorName ?? "Deleted user"}</span>
                  <span class="text-muted-foreground">{AUDIT_ACTIONS[entry.action].toLowerCase()}</span>
                  {#if entry.targetName}<span class="font-medium">{entry.targetName}</span>{/if}
                </Item.Title>
                <Item.Description>{formatDateTime(entry.createdAt)}</Item.Description>
              </Item.Content>
            </Item.Root>
          {/each}
        </Item.Group>
      {:else}
        <Empty.Root>
          <Empty.Header>
            <Empty.Media variant="icon"><ScrollTextIcon /></Empty.Media>
            <Empty.Title>No staff activity yet</Empty.Title>
            <Empty.Description>Reviews, bans and other staff actions will show up here.</Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {/if}
    </Card.Content>
  </Card.Root>
{/if}
