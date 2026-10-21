<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import * as Avatar from "$ui/avatar";
  import { Badge } from "$ui/badge";
  import * as Select from "$ui/select";
  import { createColumnHelper, renderComponent, renderSnippet, type SortingState } from "@tanstack/svelte-table";
  import DataTable from "#lib/components/data-table/DataTable.svelte";
  import DataTableSearch from "#lib/components/data-table/DataTableSearch.svelte";
  import DataTableSortButton from "#lib/components/data-table/DataTableSortButton.svelte";
  import type { DataTableFeatures } from "#lib/components/data-table/features";
  import { useSearchParams } from "#lib/hooks/search-params.svelte.js";
  import { USER_FILTERS } from "#lib/shared/admin";
  import { roleLabels, UserRole } from "#lib/shared/roles";
  import { formatDate } from "../format";
  import { listUsers } from "./users.remote";

  type Filter = (typeof USER_FILTERS)[number];
  const filterLabels: Record<Filter, string> = {
    all: "All users",
    staff: "All staff",
    banned: "Banned",
    [UserRole.TrialModerator]: roleLabels[UserRole.TrialModerator],
    [UserRole.Moderator]: roleLabels[UserRole.Moderator],
    [UserRole.HeadModerator]: roleLabels[UserRole.HeadModerator],
    [UserRole.Admin]: roleLabels[UserRole.Admin]
  };

  const params = useSearchParams({
    page: 1,
    size: 25,
    q: "",
    filter: "all" as Filter,
    sort: "createdAt" as "createdAt" | "name",
    dir: "desc" as "asc" | "desc"
  });
  const args = $derived(params.current);
  const data = $derived(await listUsers(args));
  const loading = $derived($effect.pending() > 0);
  const sorting = $derived<SortingState>([{ id: args.sort, desc: args.dir === "desc" }]);

  type Row = (typeof data.rows)[number];
  const userHref = (id: string) => resolve("/(protected)/(admin)/admin-dashboard/users/[id]", { id });

  const column = createColumnHelper<DataTableFeatures, Row>();
  const columns = column.columns([
    column.accessor("name", {
      header: ({ column }) =>
        renderComponent(DataTableSortButton, {
          label: "User",
          direction: column.getIsSorted(),
          onclick: column.getToggleSortingHandler() ?? (() => {})
        }),
      cell: ({ row }) => renderSnippet(userCell, row.original)
    }),
    column.accessor("role", {
      header: "Role",
      enableSorting: false,
      cell: ({ row }) => renderSnippet(roleCell, row.original)
    }),
    column.accessor("banned", {
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => renderSnippet(statusCell, row.original)
    }),
    column.accessor("createdAt", {
      header: ({ column }) =>
        renderComponent(DataTableSortButton, {
          label: "Joined",
          direction: column.getIsSorted(),
          onclick: column.getToggleSortingHandler() ?? (() => {})
        }),
      cell: ({ getValue }) => formatDate(getValue())
    })
  ]);
</script>

{#snippet userCell(row: Row)}
  <div class="flex items-center gap-3">
    <Avatar.Root class="size-8">
      {#if row.image}<Avatar.Image src={row.image} alt="" />{/if}
      <Avatar.Fallback class="text-xs">{row.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
    <div class="flex min-w-0 flex-col">
      <a class="truncate font-medium underline-offset-4 hover:underline" href={userHref(row.id)}>{row.name}</a>
      <span class="truncate font-mono text-xs text-muted-foreground">{row.discordId}</span>
    </div>
  </div>
{/snippet}

{#snippet roleCell(row: Row)}
  {#if row.role === UserRole.User}
    <span class="text-muted-foreground">User</span>
  {:else}
    <Badge variant="secondary">{roleLabels[row.role]}</Badge>
  {/if}
{/snippet}

{#snippet statusCell(row: Row)}
  {#if row.banned}
    <Badge variant="destructive">
      {row.banExpires ? `Banned until ${formatDate(row.banExpires)}` : "Banned"}
    </Badge>
  {:else}
    <span class="text-muted-foreground">Active</span>
  {/if}
{/snippet}

<svelte:head>
  <title>Users | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col gap-1">
  <h1 class="text-2xl font-semibold tracking-tight">Users</h1>
  <p class="text-sm text-muted-foreground">Search by name or Discord ID.</p>
</div>

<div class="flex flex-col gap-4">
  <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
    <Select.Root type="single" value={args.filter} onValueChange={(filter) => params.set({ filter: filter as Filter })}>
      <Select.Trigger class="w-full sm:w-48" aria-label="Filter users">{filterLabels[args.filter]}</Select.Trigger>
      <Select.Content>
        {#each USER_FILTERS as filter (filter)}
          <Select.Item value={filter} label={filterLabels[filter]}>{filterLabels[filter]}</Select.Item>
          {#if filter === "banned"}<Select.Separator />{/if}
        {/each}
      </Select.Content>
    </Select.Root>
    <DataTableSearch
      value={args.q}
      onSearch={(q) => params.set({ q })}
      placeholder="Search name or Discord ID…"
      label="Search users" />
  </div>

  <DataTable
    caption="Users"
    {columns}
    data={data.rows}
    rowCount={data.total}
    page={args.page}
    size={args.size}
    {loading}
    {sorting}
    onSortingChange={([next]) =>
      params.set({
        sort: (next?.id as typeof args.sort) ?? "createdAt",
        dir: next && !next.desc ? "asc" : "desc"
      })}
    getRowId={(row) => row.id}
    onPageChange={(page, size) => params.set({ page, size })}
    onRowClick={(row) => goto(userHref(row.id))}
    empty="No users match these filters." />
</div>
