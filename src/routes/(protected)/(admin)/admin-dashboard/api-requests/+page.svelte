<script lang="ts">
  import { resolve } from "$app/paths";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Sheet from "$ui/sheet";
  import * as Tabs from "$ui/tabs";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import { createColumnHelper, renderComponent, renderSnippet } from "@tanstack/svelte-table";
  import DataTable from "#lib/components/data-table/DataTable.svelte";
  import DataTableSearch from "#lib/components/data-table/DataTableSearch.svelte";
  import type { DataTableFeatures } from "#lib/components/data-table/features";
  import { useSearchParams } from "#lib/hooks/search-params.svelte.js";
  import { API_USE_CASES } from "#lib/shared/constants/developer";
  import { getStaffContext } from "../admin.remote";
  import { formatDate, formatDateTime } from "../format";
  import ReviewForm from "../review-form.svelte";
  import StatusBadge from "../status-badge.svelte";
  import { listApiRequests, reviewApiRequest } from "./api-requests.remote";

  const statuses = ["pending", "approved", "denied", "revoked", "all"] as const;
  const params = useSearchParams({ page: 1, size: 25, q: "", status: "pending" as (typeof statuses)[number] });
  const args = $derived(params.current);
  // One async derived for both, so they load in parallel without an await waterfall.
  const [data, { permissions }] = $derived(await Promise.all([listApiRequests(args), getStaffContext()]));
  const loading = $derived($effect.pending() > 0);

  type Row = (typeof data.rows)[number];
  let selectedId = $state<string | null>(null);
  const selected = $derived(data.rows.find((row) => row.id === selectedId));
  const useCaseLabel = (value: string) => API_USE_CASES.find((useCase) => useCase.value === value)?.label ?? value;

  const column = createColumnHelper<DataTableFeatures, Row>();
  const columns = column.columns([
    column.accessor("name", {
      header: "Project",
      cell: ({ row }) => renderSnippet(projectCell, row.original)
    }),
    column.accessor((row) => row.user.name, {
      id: "user",
      header: "Requested by",
      cell: ({ row }) => renderSnippet(userCell, row.original.user)
    }),
    column.accessor("useCase", { header: "Use case", cell: ({ getValue }) => useCaseLabel(getValue()) }),
    column.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => renderComponent(StatusBadge, { status: getValue() })
    }),
    column.accessor("createdAt", { header: "Submitted", cell: ({ getValue }) => formatDate(getValue()) })
  ]);
</script>

{#snippet projectCell(row: Row)}
  <Button variant="link" class="h-auto p-0 font-medium text-foreground" onclick={() => (selectedId = row.id)}>
    {row.name}
  </Button>
{/snippet}

{#snippet userCell(user: Row["user"])}
  <div class="flex items-center gap-2">
    <Avatar.Root class="size-6">
      {#if user.image}<Avatar.Image src={user.image} alt="" />{/if}
      <Avatar.Fallback class="text-[10px]">{user.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
    <span class="truncate">{user.name}</span>
  </div>
{/snippet}

<svelte:head>
  <title>Access requests | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col gap-1">
  <h1 class="text-2xl font-semibold tracking-tight">Access requests</h1>
  <p class="text-sm text-muted-foreground">Review who gets an API key. The oldest pending request is listed first.</p>
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
      placeholder="Search projects or users…"
      label="Search access requests" />
  </div>

  <DataTable
    caption="API access requests"
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
          <Sheet.Title>{selected.name}</Sheet.Title>
          <StatusBadge status={selected.status} />
        </div>
        <Sheet.Description
          >{useCaseLabel(selected.useCase)} · Submitted {formatDateTime(selected.createdAt)}</Sheet.Description>
      </Sheet.Header>
      <div class="flex flex-col gap-6 p-4">
        <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt class="text-muted-foreground">Requested by</dt>
          <dd>
            <a
              class="font-medium underline-offset-4 hover:underline"
              href={resolve("/(protected)/(admin)/admin-dashboard/users/[id]", { id: selected.user.id })}>
              {selected.user.name}
            </a>
            <span class="text-muted-foreground"> · joined {formatDate(selected.user.createdAt)}</span>
          </dd>
          <dt class="text-muted-foreground">Link</dt>
          <dd class="min-w-0">
            <!-- User-submitted URL: shown in full and opened without referrer or opener. -->
            <!-- eslint-disable svelte/no-navigation-without-resolve -->
            <a
              class="inline-flex max-w-full items-center gap-1 break-all underline-offset-4 hover:underline"
              href={selected.url}
              target="_blank"
              rel="noopener noreferrer nofollow">
              {selected.url}<ExternalLinkIcon class="size-3.5 shrink-0" />
            </a>
            <!-- eslint-enable svelte/no-navigation-without-resolve -->
          </dd>
          {#if selected.reviewedAt}
            <dt class="text-muted-foreground">Reviewed</dt>
            <dd>{formatDateTime(selected.reviewedAt)} by {selected.reviewerName ?? "a deleted user"}</dd>
          {/if}
          {#if selected.status === "approved" || selected.status === "revoked"}
            <dt class="text-muted-foreground">API key</dt>
            <dd>
              {#if selected.keyEnabled === null}
                Not generated yet
              {:else if selected.keyEnabled}
                Active
              {:else}
                Disabled
              {/if}
            </dd>
          {/if}
        </dl>
        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-medium">Description</h3>
          <p class="text-sm leading-relaxed wrap-break-word whitespace-pre-line text-muted-foreground">
            {selected.description}
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
              form={reviewApiRequest.for(selected.id)}
              id={selected.id}
              updates={[listApiRequests(args)]}
              onReviewed={() => (selectedId = null)} />
          </section>
        {:else if selected.status === "pending"}
          <p class="border-t pt-6 text-sm text-muted-foreground">Your role can view requests but not review them.</p>
        {/if}
      </div>
    {/if}
  </Sheet.Content>
</Sheet.Root>
