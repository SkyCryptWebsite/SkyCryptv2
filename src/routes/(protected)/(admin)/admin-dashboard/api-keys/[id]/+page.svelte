<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import * as Avatar from "$ui/avatar";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Dialog from "$ui/dialog";
  import * as Field from "$ui/field";
  import { Input } from "$ui/input";
  import * as Item from "$ui/item";
  import { Spinner } from "$ui/spinner";
  import { Textarea } from "$ui/textarea";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import { toast } from "svelte-sonner";
  import { AUDIT_ACTIONS } from "#lib/shared/admin";
  import { API_KEY_SCOPES, API_USE_CASES } from "#lib/shared/constants/developer";
  import { formatDate, formatDateTime, formatNumber } from "../../format";
  import StatusBadge from "../../status-badge.svelte";
  import {
    deleteApiKey,
    getApiKeyDetail,
    setApiKeyEnabled,
    setApiKeyRateLimit,
    updateApiKey
  } from "../api-keys.remote";

  const id = $derived(page.params.id ?? "");
  const detail = $derived(await getApiKeyDetail(id));
  const key = $derived(detail.key);
  const editForm = $derived(updateApiKey.for(id));

  let editOpen = $state(false);
  let action = $state<"toggle" | "limit" | "delete" | null>(null);
  let note = $state("");
  let limit = $state(0);
  let busy = $state(false);

  const windowMinutes = $derived((key.rateLimitTimeWindow ?? 300_000) / 60_000);
  const useCaseLabel = (value: string) => API_USE_CASES.find((useCase) => useCase.value === value)?.label ?? value;

  function openEdit() {
    editForm.fields.set({
      id,
      name: key.name ?? "",
      scopes: key.scopes,
      metadata: Object.keys(key.metadata).length ? JSON.stringify(key.metadata, null, 2) : "",
      note: ""
    });
    editOpen = true;
  }

  function open(kind: NonNullable<typeof action>) {
    action = kind;
    note = "";
    limit = key.rateLimitMax ?? 0;
  }

  async function confirm(event: SubmitEvent) {
    event.preventDefault();
    if (!action || busy) return;
    busy = true;
    try {
      if (action === "delete") {
        await deleteApiKey({ id, note });
        toast.success("Key deleted.");
        action = null;
        await goto(resolve("/(protected)/(admin)/admin-dashboard/api-keys"));
        return;
      }
      if (action === "toggle") {
        await setApiKeyEnabled({ id, enabled: !key.enabled, note }).updates(getApiKeyDetail(id));
        toast.success(key.enabled ? "Key disabled." : "Key enabled.");
      } else {
        await setApiKeyRateLimit({ id, max: limit, note }).updates(getApiKeyDetail(id));
        toast.success("Rate limit updated.");
      }
      action = null;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update the key.");
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>{key.name ?? key.start} | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div class="flex min-w-0 flex-col gap-1">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="truncate text-2xl font-semibold tracking-tight">{key.name ?? "Unnamed key"}</h1>
      <Badge variant={key.enabled ? "secondary" : "destructive"}>{key.enabled ? "Enabled" : "Disabled"}</Badge>
    </div>
    <p class="text-sm text-muted-foreground">
      <code class="font-mono">{key.start}…</code> · Created {formatDate(key.createdAt)}
    </p>
  </div>
  {#if detail.manageable}
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" onclick={openEdit}><PencilIcon data-icon="inline-start" />Edit</Button>
      <Button variant="outline" onclick={() => open("limit")}>Set rate limit</Button>
      <Button variant="outline" onclick={() => open("toggle")}>{key.enabled ? "Disable" : "Enable"}</Button>
      <Button variant="destructive" onclick={() => open("delete")}>
        <Trash2Icon data-icon="inline-start" />Delete
      </Button>
    </div>
  {/if}
</div>

<div class="grid gap-4 lg:grid-cols-2">
  <Card.Root>
    <Card.Header>
      <Card.Title>Key</Card.Title>
      <Card.Description>Limits, scopes and usage.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt class="text-muted-foreground">Owner</dt>
        <dd>
          <a
            class="inline-flex items-center gap-2 font-medium underline-offset-4 hover:underline"
            href={resolve("/(protected)/(admin)/admin-dashboard/users/[id]", { id: detail.owner.id })}>
            <Avatar.Root class="size-5">
              {#if detail.owner.image}<Avatar.Image src={detail.owner.image} alt="" />{/if}
              <Avatar.Fallback class="text-[10px]">{detail.owner.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
            </Avatar.Root>
            {detail.owner.name}
          </a>
        </dd>
        <dt class="text-muted-foreground">Rate limit</dt>
        <dd class="tabular-nums">
          {key.rateLimitEnabled && key.rateLimitMax
            ? `${formatNumber(key.rateLimitMax)} per ${windowMinutes} min`
            : "None"}
        </dd>
        <dt class="text-muted-foreground">Requests</dt>
        <dd class="tabular-nums">{formatNumber(key.requestCount)}</dd>
        <dt class="text-muted-foreground">Last used</dt>
        <dd>{key.lastRequest ? formatDateTime(key.lastRequest) : "Never"}</dd>
        <dt class="text-muted-foreground">Expires</dt>
        <dd>{key.expiresAt ? formatDate(key.expiresAt) : "Never"}</dd>
        <dt class="text-muted-foreground">Scopes</dt>
        <dd class="flex flex-wrap gap-1">
          {#each key.scopes as scope (scope)}
            <Badge variant="outline">{API_KEY_SCOPES[scope].label}</Badge>
          {:else}
            <span class="text-muted-foreground">None</span>
          {/each}
        </dd>
      </dl>
      <div class="flex flex-col gap-2 border-t pt-4">
        <h3 class="text-sm font-medium">Metadata</h3>
        {#if Object.keys(key.metadata).length}
          <pre class="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{JSON.stringify(
              key.metadata,
              null,
              2
            )}</pre>
        {:else}
          <p class="text-sm text-muted-foreground">No metadata.</p>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Access request</Card.Title>
      <Card.Description>What the owner told us when they asked for access.</Card.Description>
    </Card.Header>
    <Card.Content>
      {#if detail.request}
        <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt class="text-muted-foreground">Project</dt>
          <dd class="flex items-center gap-2">{detail.request.name} <StatusBadge status={detail.request.status} /></dd>
          <dt class="text-muted-foreground">Use case</dt>
          <dd>{useCaseLabel(detail.request.useCase)}</dd>
          <dt class="text-muted-foreground">Link</dt>
          <dd class="truncate">
            <!-- eslint-disable svelte/no-navigation-without-resolve -->
            <a class="underline-offset-4 hover:underline" href={detail.request.url} target="_blank" rel="noreferrer"
              >{detail.request.url}</a>
            <!-- eslint-enable svelte/no-navigation-without-resolve -->
          </dd>
        </dl>
        <p class="mt-4 text-sm whitespace-pre-line text-muted-foreground">{detail.request.description}</p>
      {:else}
        <p class="text-sm text-muted-foreground">This key isn’t linked to an access request.</p>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root class="lg:col-span-2">
    <Card.Header>
      <Card.Title>Staff history</Card.Title>
      <Card.Description>The last 20 staff actions on this key.</Card.Description>
    </Card.Header>
    <Card.Content>
      {#if detail.history.length}
        <Item.Group>
          {#each detail.history as entry (entry.id)}
            <Item.Root size="sm" class="px-0">
              <Item.Content>
                <Item.Title>{AUDIT_ACTIONS[entry.action]}</Item.Title>
                <Item.Description>
                  {formatDateTime(entry.createdAt)}{#if entry.note}
                    · {entry.note}{/if}
                </Item.Description>
              </Item.Content>
            </Item.Root>
          {/each}
        </Item.Group>
      {:else}
        <p class="text-sm text-muted-foreground">No staff actions yet.</p>
      {/if}
    </Card.Content>
  </Card.Root>
</div>

<p class="text-sm text-muted-foreground">
  <a class="underline-offset-4 hover:underline" href={resolve("/(protected)/(admin)/admin-dashboard/api-keys")}
    >← Back to API keys</a>
</p>

<Dialog.Root bind:open={editOpen}>
  <Dialog.Content>
    <form
      class="flex flex-col gap-6"
      {...editForm.enhance(async ({ submit }) => {
        try {
          if (await submit()) {
            editOpen = false;
            toast.success("Key updated.");
          }
        } catch {
          toast.error("Unable to update the key. Please try again.");
        }
      })}>
      <Dialog.Header>
        <Dialog.Title>Edit key</Dialog.Title>
        <Dialog.Description
          >Changes apply right away and carry over when the owner regenerates the key.</Dialog.Description>
      </Dialog.Header>
      <input {...editForm.fields.id.as("hidden", id)} />
      <Field.FieldGroup>
        <Field.Field data-invalid={!!editForm.fields.name.issues()}>
          <Field.FieldLabel for="key-name">Name</Field.FieldLabel>
          <Input id="key-name" {...editForm.fields.name.as("text")} maxlength={32} required />
          <Field.FieldError errors={editForm.fields.name.issues()} />
        </Field.Field>
        <Field.FieldSet>
          <Field.FieldLegend variant="label">Scopes</Field.FieldLegend>
          {#each Object.entries(API_KEY_SCOPES) as [scope, info] (scope)}
            <Field.Field orientation="horizontal">
              <input
                id="key-scope-{scope}"
                {...editForm.fields.scopes.as("checkbox", scope)}
                class="mt-0.5 size-4 shrink-0 accent-primary" />
              <Field.FieldContent>
                <Field.FieldLabel for="key-scope-{scope}" class="font-normal">{info.label}</Field.FieldLabel>
                <Field.FieldDescription>{info.description}</Field.FieldDescription>
              </Field.FieldContent>
            </Field.Field>
          {/each}
          <Field.FieldError errors={editForm.fields.scopes.issues()} />
        </Field.FieldSet>
        <Field.Field data-invalid={!!editForm.fields.metadata.issues()}>
          <Field.FieldLabel for="key-metadata">Metadata</Field.FieldLabel>
          <Textarea
            id="key-metadata"
            class="font-mono text-xs"
            {...editForm.fields.metadata.as("text")}
            rows={5}
            placeholder={'{ "notes": "…" }'} />
          <Field.FieldDescription
            >A JSON object for staff notes or project details. The owner can’t see it.</Field.FieldDescription>
          <Field.FieldError errors={editForm.fields.metadata.issues()} />
        </Field.Field>
        <Field.Field>
          <Field.FieldLabel for="key-edit-note">Note</Field.FieldLabel>
          <Textarea id="key-edit-note" {...editForm.fields.note.as("text")} rows={2} maxlength={1000} />
          <Field.FieldDescription>Saved in the audit log for other staff.</Field.FieldDescription>
        </Field.Field>
        <Field.FieldError errors={editForm.fields.allIssues()?.filter(({ path }) => path.length === 0)} />
      </Field.FieldGroup>
      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => (editOpen = false)}>Cancel</Button>
        <Button type="submit" disabled={!!editForm.pending} aria-busy={!!editForm.pending}>
          {#if editForm.pending}<Spinner data-icon="inline-start" />{/if}Save changes
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

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
            {#if action === "limit"}Set rate limit{:else if action === "delete"}Delete this key?{:else if key.enabled}Disable
              this key?{:else}Enable this key?{/if}
          </Dialog.Title>
          <Dialog.Description>
            {#if action === "limit"}
              Applies immediately and to keys {detail.owner.name} generates later.
            {:else if action === "delete"}
              Apps using this key stop working, and {detail.owner.name}’s access request is revoked, so they have to
              request access again. This can’t be undone.
            {:else if key.enabled}
              Apps using this key stop working immediately. {detail.owner.name} can request a new key afterwards.
            {:else}
              The key starts working again right away.
            {/if}
          </Dialog.Description>
        </Dialog.Header>
        <Field.FieldGroup>
          {#if action === "limit"}
            <Field.Field>
              <Field.FieldLabel for="detail-limit">Requests per {windowMinutes} minutes</Field.FieldLabel>
              <Input id="detail-limit" type="number" min={1} max={1_000_000} step={1} required bind:value={limit} />
            </Field.Field>
          {/if}
          <Field.Field>
            <Field.FieldLabel for="detail-note">Note</Field.FieldLabel>
            <Textarea id="detail-note" bind:value={note} rows={3} maxlength={1000} />
            <Field.FieldDescription>Saved in the audit log for other staff.</Field.FieldDescription>
          </Field.Field>
        </Field.FieldGroup>
        <Dialog.Footer>
          <Button type="button" variant="outline" disabled={busy} onclick={() => (action = null)}>Cancel</Button>
          <Button
            type="submit"
            variant={action === "delete" || (action === "toggle" && key.enabled) ? "destructive" : "default"}
            disabled={busy}
            aria-busy={busy}>
            {#if busy}<Spinner data-icon="inline-start" />{/if}
            {#if action === "limit"}
              Save limit
            {:else if action === "delete"}
              Delete key
            {:else if key.enabled}
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
