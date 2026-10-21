<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Dialog from "$ui/dialog";
  import * as DropdownMenu from "$ui/dropdown-menu";
  import * as Field from "$ui/field";
  import { Input } from "$ui/input";
  import { Spinner } from "$ui/spinner";
  import * as Tabs from "$ui/tabs";
  import { Textarea } from "$ui/textarea";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import { createColumnHelper, renderSnippet } from "@tanstack/svelte-table";
  import { toast } from "svelte-sonner";
  import DataTable from "#lib/components/data-table/DataTable.svelte";
  import DataTableSearch from "#lib/components/data-table/DataTableSearch.svelte";
  import type { DataTableFeatures } from "#lib/components/data-table/features";
  import { useSearchParams } from "#lib/hooks/search-params.svelte.js";
  import { getStaffContext } from "../admin.remote";
  import { formatDate, formatNumber } from "../format";
  import { listApiKeys, setApiKeyEnabled, setApiKeyRateLimit } from "./api-keys.remote";

  const states = ["all", "enabled", "disabled"] as const;
  const params = useSearchParams({ page: 1, size: 25, q: "", state: "all" as (typeof states)[number] });
  const args = $derived(params.current);
  // One async derived for both, so they load in parallel without an await waterfall.
  const [data, { permissions }] = $derived(await Promise.all([listApiKeys(args), getStaffContext()]));
  const loading = $derived($effect.pending() > 0);

  type Row = (typeof data.rows)[number];
  const keyHref = (id: string) => resolve("/(protected)/(admin)/admin-dashboard/api-keys/[id]", { id });
  let action = $state<{ kind: "toggle" | "limit"; row: Row } | null>(null);
  let note = $state("");
  let limit = $state(0);
  let busy = $state(false);

  function open(kind: "toggle" | "limit", row: Row) {
    action = { kind, row };
    note = "";
    limit = row.rateLimitMax ?? 0;
  }

  async function confirm(event: SubmitEvent) {
    event.preventDefault();
    if (!action || busy) return;
    const { kind, row } = action;
    busy = true;
    try {
      if (kind === "toggle") {
        await setApiKeyEnabled({ id: row.id, enabled: !row.enabled, note }).updates(listApiKeys(args));
        toast.success(row.enabled ? "Key disabled." : "Key enabled.");
      } else {
        await setApiKeyRateLimit({ id: row.id, max: limit, note }).updates(listApiKeys(args));
        toast.success("Rate limit updated.");
      }
      action = null;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update the key.");
    } finally {
      busy = false;
    }
  }

  const column = createColumnHelper<DataTableFeatures, Row>();
  const columns = $derived(
    column.columns([
      column.accessor("start", { header: "Key", cell: ({ row }) => renderSnippet(keyCell, row.original) }),
      column.accessor((row) => row.user.name, {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => renderSnippet(ownerCell, row.original)
      }),
      column.accessor("enabled", { header: "Status", cell: ({ row }) => renderSnippet(statusCell, row.original) }),
      column.accessor("rateLimitMax", {
        header: "Rate limit",
        cell: ({ row }) =>
          row.original.rateLimitMax && row.original.rateLimitTimeWindow
            ? `${formatNumber(row.original.rateLimitMax)} / ${row.original.rateLimitTimeWindow / 60_000} min`
            : "None"
      }),
      column.accessor("requestCount", { header: "Requests", cell: ({ getValue }) => formatNumber(getValue() ?? 0) }),
      column.accessor("lastRequest", {
        header: "Last used",
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? formatDate(value) : "Never";
        }
      }),
      ...(permissions.manageKeys
        ? [column.display({ id: "actions", cell: ({ row }) => renderSnippet(actionsCell, row.original) })]
        : [])
    ])
  );
</script>

{#snippet keyCell(row: Row)}
  <div class="flex flex-col">
    <a class="font-mono text-xs underline-offset-4 hover:underline" href={keyHref(row.id)}>{row.start}…</a>
    <span class="text-xs text-muted-foreground">{row.projectName ?? "No access request"}</span>
  </div>
{/snippet}

{#snippet ownerCell(row: Row)}
  <a
    class="font-medium underline-offset-4 hover:underline"
    href={resolve("/(protected)/(admin)/admin-dashboard/users/[id]", { id: row.user.id })}>
    {row.user.name}
  </a>
{/snippet}

{#snippet statusCell(row: Row)}
  <Badge variant={row.enabled ? "secondary" : "destructive"}>{row.enabled ? "Enabled" : "Disabled"}</Badge>
{/snippet}

{#snippet actionsCell(row: Row)}
  <div class="flex justify-end">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="icon-sm" aria-label="Actions for key {row.start}">
            <EllipsisIcon />
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item onSelect={() => goto(keyHref(row.id))}>Edit details</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => open("limit", row)}>Set rate limit</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant={row.enabled ? "destructive" : "default"} onSelect={() => open("toggle", row)}>
          {row.enabled ? "Disable key" : "Enable key"}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
{/snippet}

<svelte:head>
  <title>API keys | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col gap-1">
  <h1 class="text-2xl font-semibold tracking-tight">API keys</h1>
  <p class="text-sm text-muted-foreground">
    Disabling a key revokes the owner’s access. They can request a new key, which goes through review again.
  </p>
</div>

<div class="flex flex-col gap-4">
  <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
    <Tabs.Root value={args.state} onValueChange={(state) => params.set({ state: state as typeof args.state })}>
      <Tabs.List>
        {#each states as state (state)}
          <Tabs.Trigger value={state} class="capitalize">{state}</Tabs.Trigger>
        {/each}
      </Tabs.List>
    </Tabs.Root>
    <DataTableSearch
      value={args.q}
      onSearch={(q) => params.set({ q })}
      placeholder="Search owners, projects or key prefixes…"
      label="Search API keys" />
  </div>

  <DataTable
    caption="API keys"
    {columns}
    data={data.rows}
    rowCount={data.total}
    page={args.page}
    size={args.size}
    {loading}
    getRowId={(row) => row.id}
    onRowClick={(row) => goto(keyHref(row.id))}
    onPageChange={(page, size) => params.set({ page, size })}
    empty="No API keys match these filters." />
</div>

<Dialog.Root
  open={!!action}
  onOpenChange={(open) => {
    if (!open && !busy) action = null;
  }}>
  <Dialog.Content>
    {#if action}
      <form class="flex flex-col gap-6" onsubmit={confirm}>
        <Dialog.Header>
          <Dialog.Title>
            {#if action.kind === "limit"}Set rate limit{:else if action.row.enabled}Disable this key?{:else}Enable this
              key?{/if}
          </Dialog.Title>
          <Dialog.Description>
            {#if action.kind === "limit"}
              Applies to <code class="font-mono">{action.row.start}…</code> immediately and to keys
              {action.row.user.name} generates later.
            {:else if action.row.enabled}
              Apps using <code class="font-mono">{action.row.start}…</code> stop working immediately. {action.row.user
                .name}
              can request a new key afterwards.
            {:else}
              <code class="font-mono">{action.row.start}…</code> starts working again right away.
            {/if}
          </Dialog.Description>
        </Dialog.Header>
        <Field.FieldGroup>
          {#if action.kind === "limit"}
            <Field.Field>
              <Field.FieldLabel for="key-limit">
                Requests per {(action.row.rateLimitTimeWindow ?? 300_000) / 60_000} minutes
              </Field.FieldLabel>
              <Input id="key-limit" type="number" min={1} max={1_000_000} step={1} required bind:value={limit} />
            </Field.Field>
          {/if}
          <Field.Field>
            <Field.FieldLabel for="key-note">Note</Field.FieldLabel>
            <Textarea id="key-note" bind:value={note} rows={3} maxlength={1000} />
            <Field.FieldDescription>Saved in the audit log for other staff.</Field.FieldDescription>
          </Field.Field>
        </Field.FieldGroup>
        <Dialog.Footer>
          <Button type="button" variant="outline" disabled={busy} onclick={() => (action = null)}>Cancel</Button>
          <Button
            type="submit"
            variant={action.kind === "toggle" && action.row.enabled ? "destructive" : "default"}
            disabled={busy}
            aria-busy={busy}>
            {#if busy}<Spinner data-icon="inline-start" />{/if}
            {#if action.kind === "limit"}
              Save limit
            {:else if action.row.enabled}
              Disable key
            {:else}
              Enable key
            {/if}
          </Button>
        </Dialog.Footer>
      </form>
    {/if}
  </Dialog.Content>
</Dialog.Root>
