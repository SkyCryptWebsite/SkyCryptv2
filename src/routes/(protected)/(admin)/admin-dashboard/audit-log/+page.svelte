<script lang="ts">
  import { resolve } from "$app/paths";
  import * as Avatar from "$ui/avatar";
  import { Badge } from "$ui/badge";
  import * as Select from "$ui/select";
  import { createColumnHelper, renderSnippet } from "@tanstack/svelte-table";
  import DataTable from "#lib/components/data-table/DataTable.svelte";
  import DataTableSearch from "#lib/components/data-table/DataTableSearch.svelte";
  import type { DataTableFeatures } from "#lib/components/data-table/features";
  import { useSearchParams } from "#lib/hooks/search-params.svelte.js";
  import { AUDIT_ACTIONS, type AuditAction } from "#lib/shared/admin";
  import { formatDateTime } from "../format";
  import { listAuditLog } from "./audit-log.remote";

  const params = useSearchParams({ page: 1, size: 25, q: "", action: "all" as AuditAction | "all" });
  const args = $derived(params.current);
  const data = $derived(await listAuditLog(args));
  const loading = $derived($effect.pending() > 0);

  type Row = (typeof data.rows)[number];

  // Shows the most useful detail per action without dumping raw JSON.
  function describe(row: Row) {
    const details = row.details ?? {};
    if (row.action === "user.set_role") return `${details.from} → ${details.to}`;
    if (row.action === "user.ban") return `Duration: ${details.duration}`;
    if (row.action === "api_key.rate_limit") return `New limit: ${details.max}`;
    if (row.action === "api_key.update")
      return `Name: ${details.name} · Scopes: ${(details.scopes as string[]).join(", ") || "none"}`;
    if (row.action === "user.update") return `Developer mode ${details.developerMode ? "on" : "off"}`;
    if (row.action === "rate_limit.approve" || row.action === "rate_limit.deny")
      return `Requested: ${details.requestedMax}`;
    return null;
  }

  const column = createColumnHelper<DataTableFeatures, Row>();
  const columns = column.columns([
    column.accessor("createdAt", {
      header: "When",
      cell: ({ getValue }) => renderSnippet(whenCell, getValue())
    }),
    column.accessor((row) => row.actor?.name, {
      id: "actor",
      header: "Staff member",
      cell: ({ row }) => renderSnippet(actorCell, row.original)
    }),
    column.accessor("action", { header: "Action", cell: ({ row }) => renderSnippet(actionCell, row.original) }),
    column.accessor((row) => row.target?.name, {
      id: "target",
      header: "User",
      cell: ({ row }) => renderSnippet(targetCell, row.original)
    }),
    column.accessor("note", { header: "Note", cell: ({ row }) => renderSnippet(noteCell, row.original) })
  ]);
</script>

{#snippet whenCell(value: Date)}
  <span class="whitespace-nowrap text-muted-foreground tabular-nums">{formatDateTime(value)}</span>
{/snippet}

{#snippet actorCell(row: Row)}
  <div class="flex items-center gap-2">
    <Avatar.Root class="size-6">
      {#if row.actor?.image}<Avatar.Image src={row.actor.image} alt="" />{/if}
      <Avatar.Fallback class="text-[10px]">{(row.actor?.name ?? "?").slice(0, 2).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
    <span class="truncate"
      >{row.actor?.name ?? (row.action === "user.ban_evasion" ? "Automatic" : "Deleted user")}</span>
  </div>
{/snippet}

{#snippet actionCell(row: Row)}
  {const detail = describe(row)}
  <div class="flex flex-col items-start gap-1">
    <Badge variant="outline">{AUDIT_ACTIONS[row.action]}</Badge>
    {#if detail}<span class="text-xs text-muted-foreground">{detail}</span>{/if}
  </div>
{/snippet}

{#snippet targetCell(row: Row)}
  {#if row.target}
    <a
      class="font-medium underline-offset-4 hover:underline"
      href={resolve("/(protected)/(admin)/admin-dashboard/users/[id]", { id: row.target.id })}>
      {row.target.name}
    </a>
  {:else}
    <span class="text-muted-foreground">Deleted user</span>
  {/if}
{/snippet}

{#snippet noteCell(row: Row)}
  {#if row.note}
    <p class="line-clamp-2 max-w-sm text-sm whitespace-normal text-muted-foreground" title={row.note}>{row.note}</p>
  {:else}
    <span class="text-muted-foreground">—</span>
  {/if}
{/snippet}

<svelte:head>
  <title>Audit log | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col gap-1">
  <h1 class="text-2xl font-semibold tracking-tight">Audit log</h1>
  <p class="text-sm text-muted-foreground">Every staff action, newest first. Entries can’t be edited or removed.</p>
</div>

<div class="flex flex-col gap-4">
  <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
    <Select.Root
      type="single"
      value={args.action}
      onValueChange={(action) => params.set({ action: action as typeof args.action })}>
      <Select.Trigger class="w-full sm:w-56" aria-label="Filter by action">
        {args.action === "all" ? "All actions" : AUDIT_ACTIONS[args.action]}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all" label="All actions">All actions</Select.Item>
        <Select.Separator />
        {#each Object.entries(AUDIT_ACTIONS) as [value, label] (value)}
          <Select.Item {value} {label}>{label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    <DataTableSearch
      value={args.q}
      onSearch={(q) => params.set({ q })}
      placeholder="Search staff, users or notes…"
      label="Search the audit log" />
  </div>

  <DataTable
    caption="Audit log"
    {columns}
    data={data.rows}
    rowCount={data.total}
    page={args.page}
    size={args.size}
    {loading}
    getRowId={(row) => row.id}
    onPageChange={(page, size) => params.set({ page, size })}
    empty="No staff actions match these filters." />
</div>
