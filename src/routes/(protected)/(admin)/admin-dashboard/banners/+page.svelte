<script lang="ts">
  import { BANNER_VARIANTS } from "$types";
  import * as AlertDialog from "$ui/alert-dialog";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Field from "$ui/field";
  import * as Select from "$ui/select";
  import * as Sheet from "$ui/sheet";
  import { Spinner } from "$ui/spinner";
  import { Switch } from "$ui/switch";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import type { JSONContent } from "@tiptap/core";
  import { toast } from "svelte-sonner";
  import UserChip from "#lib/components/misc/UserChip.svelte";
  import Banner, { BANNER_LABELS } from "#lib/components/newsroom/Banner.svelte";
  import type { BannerData } from "#lib/shared/newsroom";
  import DateTimePicker from "../date-time-picker.svelte";
  import { formatDateTime } from "../format";
  import BannerEditor from "./banner-editor.svelte";
  import { deleteBanner, listBanners, saveBanner } from "./banners.remote";

  const banners = $derived(await listBanners());
  type Row = (typeof banners)[number];

  const emptyDoc: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };
  const blank = (): BannerData => ({
    content: emptyDoc,
    variant: "info",
    dismissible: true,
    enabled: true,
    startsAt: null,
    endsAt: null
  });

  let editing = $state<{ id: string | null; data: BannerData } | null>(null);
  let deleting = $state<Row | null>(null);
  let saving = $state(false);

  function status(row: Row) {
    const now = new Date();
    if (!row.enabled) return { label: "Disabled", variant: "outline" as const };
    if (row.endsAt && row.endsAt <= now) return { label: "Ended", variant: "outline" as const };
    if (row.startsAt && row.startsAt > now) return { label: "Scheduled", variant: "secondary" as const };
    return { label: "Live", variant: "default" as const };
  }

  const message = (error: unknown) =>
    (error as { body?: { message?: string } })?.body?.message ?? "Unable to save the banner. Please try again.";

  async function save() {
    if (!editing) return;
    saving = true;
    try {
      await saveBanner({ id: editing.id, data: $state.snapshot(editing.data) });
      toast.success("Banner saved.");
      editing = null;
    } catch (error) {
      toast.error(message(error));
    } finally {
      saving = false;
    }
  }

  async function remove(row: Row) {
    deleting = null;
    try {
      await deleteBanner(row.id);
      toast.success("Banner deleted.");
    } catch (error) {
      toast.error(message(error));
    }
  }
</script>

<svelte:head>
  <title>Banners | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
  <div class="flex flex-col gap-1">
    <h1 class="text-2xl font-semibold tracking-tight">Banners</h1>
    <p class="text-sm text-muted-foreground">
      Site-wide notices. Changes reach open pages right away; dismissals are remembered per browser.
    </p>
  </div>
  <Button onclick={() => (editing = { id: null, data: blank() })}
    ><PlusIcon data-icon="inline-start" />New banner</Button>
</div>

{#if banners.length}
  <ul class="flex flex-col gap-3">
    {#each banners as row (row.id)}
      {@const state = status(row)}
      <li class="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <Banner html={row.html} variant={row.variant} class="overflow-hidden rounded-lg border" />
          <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={state.variant}>{state.label}</Badge>
            <Badge variant="outline">{BANNER_LABELS[row.variant]}</Badge>
            {#if !row.dismissible}<Badge variant="outline">Not dismissible</Badge>{/if}
            {#if row.startsAt}<span>From {formatDateTime(row.startsAt)}</span>{/if}
            {#if row.endsAt}<span>Until {formatDateTime(row.endsAt)}</span>{/if}
            <UserChip profile={row.author} />
          </div>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            onclick={() =>
              (editing = {
                id: row.id,
                data: {
                  content: row.content,
                  variant: row.variant,
                  dismissible: row.dismissible,
                  enabled: row.enabled,
                  startsAt: row.startsAt,
                  endsAt: row.endsAt
                }
              })}>
            Edit
          </Button>
          <Button variant="ghost" class="text-destructive" onclick={() => (deleting = row)}>Delete</Button>
        </div>
      </li>
    {/each}
  </ul>
{:else}
  <p class="rounded-xl border p-6 text-center text-sm text-muted-foreground">No banners yet.</p>
{/if}

<Sheet.Root
  open={!!editing}
  onOpenChange={(open) => {
    if (!open) editing = null;
  }}>
  <Sheet.Content class="w-full gap-0 overflow-y-auto sm:max-w-lg">
    {#if editing}
      <Sheet.Header class="border-b">
        <Sheet.Title>{editing.id ? "Edit banner" : "New banner"}</Sheet.Title>
        <Sheet.Description>Keep it to a line or two. Link to a post for the details.</Sheet.Description>
      </Sheet.Header>
      <div class="flex flex-col gap-6 p-4">
        <Field.FieldGroup>
          <Field.Field>
            <Field.FieldLabel for="banner-content">Message</Field.FieldLabel>
            <BannerEditor
              id="banner-content"
              content={editing.data.content}
              onchange={(content) => editing && (editing.data.content = content)} />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="banner-variant">Style</Field.FieldLabel>
            <Select.Root type="single" bind:value={editing.data.variant}>
              <Select.Trigger id="banner-variant" class="w-full">{BANNER_LABELS[editing.data.variant]}</Select.Trigger>
              <Select.Content>
                {#each BANNER_VARIANTS as variant (variant)}
                  <Select.Item value={variant}>{BANNER_LABELS[variant]}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="banner-starts">Starts</Field.FieldLabel>
            <DateTimePicker id="banner-starts" bind:value={editing.data.startsAt} placeholder="Right away" />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="banner-ends">Ends</Field.FieldLabel>
            <DateTimePicker id="banner-ends" bind:value={editing.data.endsAt} placeholder="When disabled" future />
          </Field.Field>
          <Field.Field orientation="horizontal">
            <Switch id="banner-dismissible" bind:checked={editing.data.dismissible} />
            <Field.FieldLabel for="banner-dismissible">Visitors can dismiss it</Field.FieldLabel>
          </Field.Field>
          <Field.Field orientation="horizontal">
            <Switch id="banner-enabled" bind:checked={editing.data.enabled} />
            <Field.FieldLabel for="banner-enabled">Enabled</Field.FieldLabel>
          </Field.Field>
        </Field.FieldGroup>
        <div class="flex justify-end gap-2">
          <Button variant="outline" onclick={() => (editing = null)}>Cancel</Button>
          <Button onclick={save} disabled={saving}>
            {#if saving}<Spinner data-icon="inline-start" />{/if}
            Save
          </Button>
        </div>
      </div>
    {/if}
  </Sheet.Content>
</Sheet.Root>

<AlertDialog.Root
  open={!!deleting}
  onOpenChange={(open) => {
    if (!open) deleting = null;
  }}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete this banner?</AlertDialog.Title>
      <AlertDialog.Description>It disappears from every open page right away.</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={() => deleting && remove(deleting)}>Delete</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
