<script lang="ts">
  import { resolve } from "$app/paths";
  import { Button } from "$ui/button";
  import * as Sheet from "$ui/sheet";
  import * as Tabs from "$ui/tabs";
  import { createColumnHelper, renderComponent, renderSnippet } from "@tanstack/svelte-table";
  import DataTable from "#lib/components/data-table/DataTable.svelte";
  import DataTableSearch from "#lib/components/data-table/DataTableSearch.svelte";
  import type { DataTableFeatures } from "#lib/components/data-table/features";
  import { useSearchParams } from "#lib/hooks/search-params.svelte.js";
  import { getStaffContext } from "../admin.remote";
  import { formatDate, formatDateTime, formatNumber } from "../format";
  import ReviewForm from "../review-form.svelte";
  import StatusBadge from "../status-badge.svelte";
  import { listRateLimitRequests, reviewRateLimitRequest } from "./rate-limits.remote";

  const statuses = ["pending", "approved", "denied", "all"] as const;
  const params = useSearchParams({ page: 1, size: 25, q: "", status: "pending" as (typeof statuses)[number] });
  const args = $derived(params.current);
  // One async derived for both, so they load in parallel without an await waterfall.
  const [data, { permissions }] = $derived(await Promise.all([listRateLimitRequests(args), getStaffContext()]));
  const loading = $derived($effect.pending() > 0);

  type Row = (typeof data.rows)[number];
  let selectedId = $state<string | null>(null);
  const selected = $derived(data.rows.find((row) => row.id === selectedId));
  const perWindow = (row: Row) => (row.timeWindow ? ` / ${row.timeWindow / 60_000} min` : "");

  const column = createColumnHelper<DataTableFeatures, Row>();
  const columns = column.columns([
    column.accessor((row) => row.user.name, {
      id: "user",
      header: "User",
      cell: ({ row }) => renderSnippet(userCell, row.original)
    }),
    column.accessor("projectName", { header: "Project" }),
    column.accessor("currentMax", {
      header: "Current",
      cell: ({ row }) =>
        row.original.currentMax ? formatNumber(row.original.currentMax) + perWindow(row.original) : "No key"
    }),
    column.accessor("requestedMax", {
      header: "Requested",
      cell: ({ row }) => formatNumber(row.original.requestedMax) + perWindow(row.original)
    }),
    column.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => renderComponent(StatusBadge, { status: getValue() })
    }),
    column.accessor("createdAt", { header: "Submitted", cell: ({ getValue }) => formatDate(getValue()) })
  ]);
</script>

{#snippet userCell(row: Row)}
  <Button variant="link" class="h-auto p-0 font-medium text-foreground" onclick={() => (selectedId = row.id)}>
    {row.user.name}
  </Button>
{/snippet}

<svelte:head>
  <title>Rate limits | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col gap-1">
  <h1 class="text-2xl font-semibold tracking-tight">Rate limit requests</h1>
  <p class="text-sm text-muted-foreground">
    Approving updates the user’s current key right away and carries over when they regenerate it.
  </p>
</div>

<div class="flex flex-col gap-4">
  <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
    <Tabs.Root value={args.status} onValueChange={(status) => params.set({ status: status as typeof args.status })}>
      <Tabs.List>
        {#each statuses as status (status)}
          <Tabs.Trigger value={status} class="capitalize">{status}</Tabs.Trigger>
        {/each}
      </Tabs.List>
    </Tabs.Root>
    <DataTableSearch
      value={args.q}
      onSearch={(q) => params.set({ q })}
      placeholder="Search users…"
      label="Search rate limit requests" />
  </div>

  <DataTable
    caption="Rate limit requests"
    {columns}
    data={data.rows}
    rowCount={data.total}
    page={args.page}
    size={args.size}
    {loading}
    getRowId={(row) => row.id}
    onPageChange={(page, size) => params.set({ page, size })}
    onRowClick={(row) => (selectedId = row.id)}
    empty={args.status === "pending" ? "No requests are waiting for review." : "No requests match these filters."} />
</div>

<Sheet.Root
  open={!!selected}
  onOpenChange={(open) => {
    if (!open) selectedId = null;
  }}>
  <Sheet.Content class="w-full gap-0 overflow-y-auto sm:max-w-lg">
    {#if selected}
      <Sheet.Header class="border-b">
        <div class="flex items-center gap-2">
          <Sheet.Title>Rate limit for {selected.projectName}</Sheet.Title>
          <StatusBadge status={selected.status} />
        </div>
        <Sheet.Description>Submitted {formatDateTime(selected.createdAt)}</Sheet.Description>
      </Sheet.Header>
      <div class="flex flex-col gap-6 p-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg border p-3">
            <p class="text-xs text-muted-foreground">Current limit</p>
            <p class="text-xl font-semibold tabular-nums">
              {selected.currentMax ? formatNumber(selected.currentMax) : "—"}
            </p>
          </div>
          <div class="rounded-lg border p-3">
            <p class="text-xs text-muted-foreground">Requested</p>
            <p class="text-xl font-semibold tabular-nums">{formatNumber(selected.requestedMax)}</p>
          </div>
        </div>
        <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt class="text-muted-foreground">User</dt>
          <dd>
            <a
              class="font-medium underline-offset-4 hover:underline"
              href={resolve("/(protected)/(admin)/admin-dashboard/users/[id]", { id: selected.user.id })}>
              {selected.user.name}
            </a>
          </dd>
          <dt class="text-muted-foreground">Window</dt>
          <dd>{selected.timeWindow ? `${selected.timeWindow / 60_000} minutes` : "No active key"}</dd>
          <dt class="text-muted-foreground">Requests made</dt>
          <dd class="tabular-nums">{formatNumber(selected.requestCount ?? 0)} total with the current key</dd>
          {#if selected.reviewedAt}
            <dt class="text-muted-foreground">Reviewed</dt>
            <dd>{formatDateTime(selected.reviewedAt)} by {selected.reviewerName ?? "a deleted user"}</dd>
          {/if}
        </dl>
        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-medium">Reason</h3>
          <p class="text-sm leading-relaxed wrap-break-word whitespace-pre-line text-muted-foreground">
            {selected.reason}
          </p>
        </section>
        {#if selected.reviewNote}
          <section class="flex flex-col gap-2">
            <h3 class="text-sm font-medium">Note to the user</h3>
            <p class="text-sm wrap-break-word whitespace-pre-line text-muted-foreground">{selected.reviewNote}</p>
          </section>
        {/if}
        {#if selected.status === "pending" && permissions.reviewRequests}
          <section class="flex flex-col gap-3 border-t pt-6">
            <h3 class="text-sm font-medium">Review</h3>
            <ReviewForm
              form={reviewRateLimitRequest.for(selected.id)}
              id={selected.id}
              updates={[listRateLimitRequests(args)]}
              onReviewed={() => (selectedId = null)} />
          </section>
        {:else if selected.status === "pending"}
          <p class="border-t pt-6 text-sm text-muted-foreground">Your role can view requests but not review them.</p>
        {/if}
      </div>
    {/if}
  </Sheet.Content>
</Sheet.Root>
