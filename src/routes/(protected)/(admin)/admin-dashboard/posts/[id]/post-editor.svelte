<script lang="ts">
  import { beforeNavigate, goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { POST_TYPES } from "$types";
  import * as AlertDialog from "$ui/alert-dialog";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Field from "$ui/field";
  import { Input } from "$ui/input";
  import * as Select from "$ui/select";
  import * as Sheet from "$ui/sheet";
  import { Spinner } from "$ui/spinner";
  import { Switch } from "$ui/switch";
  import { Textarea } from "$ui/textarea";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import HistoryIcon from "@lucide/svelte/icons/history";
  import ImagePlusIcon from "@lucide/svelte/icons/image-plus";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import { toast } from "svelte-sonner";
  import { stripTransientNodes } from "#lib/components/edra/extensions";
  import { createEditor, Edra } from "#lib/components/edra/shadcn";
  import UserChip from "#lib/components/misc/UserChip.svelte";
  import { POST_TYPE_LABELS } from "#lib/components/newsroom/TypeBadge.svelte";
  import { slugify, type PostData } from "#lib/shared/newsroom";
  import DateTimePicker from "../../date-time-picker.svelte";
  import { formatDateTime } from "../../format";
  import PostStatus from "../post-status.svelte";
  import {
    deletePost,
    discardChanges,
    getPost,
    listRevisions,
    publishPost,
    savePost,
    unpublishPost
  } from "../posts.remote";
  import { uploadFile, uploadImage } from "../upload";

  let { id }: { id: string } = $props();

  // Loaded once; afterwards this component owns the fields and autosaves them.
  // svelte-ignore state_referenced_locally
  const initial = await getPost(id);
  const post = $derived(await getPost(id));

  const { content: initialContent, ...initialFields } = initial.data;
  const fields = $state(initialFields);
  // Raw, because the document is replaced on every keystroke and never mutated in place.
  let content = $state.raw(initialContent);
  let tagsInput = $state(initialFields.tags.join(", "));

  const data = (): PostData => ({ ...$state.snapshot(fields), content });
  // Built the same way as `currentJson`, so key order matches.
  // Built the same way as `currentJson`, so the key order matches.
  let savedJson = $state(JSON.stringify(data()));
  let failedJson = $state<string | null>(null);
  let saving = $state(false);
  let saveError = $state<string | null>(null);
  let busy = $state(false);
  let publishAt = $state<Date | null>(initial.publishedAt);
  let deleteOpen = $state(false);
  let historyOpen = $state(false);

  const currentJson = $derived(JSON.stringify(data()));
  const dirty = $derived(currentJson !== savedJson);
  const isPublished = $derived(post.status === "published");
  const isScheduled = $derived(isPublished && !!post.publishedAt && post.publishedAt > new Date());

  const editor = createEditor({
    content: initialContent,
    onFileUpload: async (file) => {
      try {
        return await uploadFile(file);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed.");
        throw error;
      }
    },
    onUpdate: ({ editor }) => (content = stripTransientNodes(editor.getJSON()))
  });

  const message = (error: unknown) =>
    (error as { body?: { message?: string } })?.body?.message ??
    (error instanceof Error ? error.message : "Something went wrong.");

  async function save() {
    const json = currentJson;
    if (json === savedJson) return;
    saving = true;
    try {
      await savePost({ id, data: JSON.parse(json) }).updates(getPost(id));
      savedJson = json;
      saveError = failedJson = null;
    } catch (error) {
      saveError = message(error);
      failedJson = json;
    } finally {
      saving = false;
    }
  }

  // Autosave shortly after typing stops. A failed version isn't retried until it changes.
  $effect(() => {
    if (!dirty || saving || currentJson === failedJson) return;
    const timeout = setTimeout(save, 1500);
    return () => clearTimeout(timeout);
  });

  beforeNavigate(({ cancel, type }) => {
    if (!dirty) return;
    if (type === "leave") cancel();
    else void save();
  });

  /** Runs a publishing action after saving pending edits, so nothing is lost. */
  async function run(action: () => Promise<unknown>, success: string) {
    busy = true;
    try {
      await save();
      if (saveError) throw new Error(saveError);
      await action();
      await getPost(id).refresh();
      toast.success(success);
    } catch (error) {
      toast.error(message(error));
    } finally {
      busy = false;
    }
  }

  /** Publishing sends the current fields along, so they count as saved afterwards. */
  async function publish(date: Date | null) {
    const json = currentJson;
    busy = true;
    try {
      await publishPost({ id, data: JSON.parse(json), publishedAt: date });
      await getPost(id).refresh();
      savedJson = json;
      saveError = failedJson = null;
      toast.success(date && date > new Date() ? `Scheduled for ${formatDateTime(date)}.` : "Published.");
    } catch (error) {
      toast.error(message(error));
    } finally {
      busy = false;
    }
  }

  async function discard() {
    busy = true;
    try {
      await discardChanges(id);
      // Reload to show the published version; nothing local is worth keeping.
      savedJson = currentJson;
      location.reload();
    } catch (error) {
      toast.error(message(error));
      busy = false;
    }
  }

  async function remove() {
    busy = true;
    try {
      await deletePost(id);
      savedJson = currentJson;
      toast.success("Post deleted.");
      await goto(resolve("/(protected)/(admin)/admin-dashboard/posts"));
    } catch (error) {
      toast.error(message(error));
      busy = false;
    }
  }

  function restore(revision: PostData) {
    const { content: revisionContent, ...revisionFields } = revision;
    Object.assign(fields, revisionFields);
    tagsInput = revisionFields.tags.join(", ");
    editor?.commands.setContent(revisionContent);
    content = revisionContent;
    historyOpen = false;
    toast.success("Revision restored. Publish to make it live.");
  }

  async function preview() {
    await save();
    window.open(`/newsroom/${fields.slug}?preview=1`, "_blank", "noopener");
  }

  let heroUploading = $state(false);
  async function onHeroFile(event: Event & { currentTarget: HTMLInputElement }) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    heroUploading = true;
    try {
      fields.heroImage = { ...(await uploadImage(file)), alt: fields.heroImage?.alt ?? "" };
    } catch (error) {
      toast.error(message(error));
    } finally {
      heroUploading = false;
    }
  }

  const syncTags = () =>
    (fields.tags = [
      ...new Set(
        tagsInput
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
      )
    ]);

  const statusText = $derived.by(() => {
    if (saving) return "Saving…";
    if (saveError) return saveError;
    if (dirty) return "Unsaved changes";
    if (post.hasChanges) return "Changes saved, not published yet";
    return "Saved";
  });
</script>

<svelte:window
  onbeforeunload={(event) => {
    if (dirty) event.preventDefault();
  }} />

<svelte:head>
  <title>{fields.title || "Untitled post"} | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
  <div class="flex min-w-0 flex-col gap-1">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="truncate text-2xl font-semibold tracking-tight">{fields.title || "Untitled post"}</h1>
      <PostStatus status={post.status} publishedAt={post.publishedAt} hasChanges={post.hasChanges} />
    </div>
    <p class={["text-sm", saveError ? "text-destructive" : "text-muted-foreground"]} role="status">{statusText}</p>
  </div>
  <div class="flex flex-wrap gap-2">
    <Button variant="outline" onclick={() => (historyOpen = true)}
      ><HistoryIcon data-icon="inline-start" />History</Button>
    <Button variant="outline" onclick={preview}><ExternalLinkIcon data-icon="inline-start" />Preview</Button>
  </div>
</div>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
  <div class="flex min-w-0 flex-col gap-4">
    <Field.Field>
      <Field.FieldLabel for="post-title" class="sr-only">Title</Field.FieldLabel>
      <Input
        id="post-title"
        bind:value={fields.title}
        maxlength={200}
        placeholder="Post title"
        class="h-12 text-2xl font-semibold md:text-2xl"
        oninput={() => {
          if (fields.slug.startsWith("untitled-") && fields.title) fields.slug = slugify(fields.title);
        }} />
    </Field.Field>
    <div class="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      {#if editor}
        <Edra {editor}>
          <div class="overflow-x-auto border-b p-1"><Edra.Toolbar /></div>
          <Edra.BubbleMenu />
          <Edra.DragHandle />
          <Edra.Content class="min-h-[60svh] px-4 py-6 sm:px-12" />
        </Edra>
      {/if}
    </div>
  </div>

  <aside class="flex flex-col gap-4">
    <Card.Root>
      <Card.Header>
        <Card.Title>Publishing</Card.Title>
        <Card.Description>
          {#if isScheduled && post.publishedAt}
            Goes live {formatDateTime(post.publishedAt)}.
          {:else if isPublished && post.publishedAt}
            Live since {formatDateTime(post.publishedAt)}.
          {:else}
            Only staff can see drafts.
          {/if}
        </Card.Description>
      </Card.Header>
      <Card.Content class="flex flex-col gap-3">
        <Button onclick={() => publish(null)} disabled={busy}>
          {#if busy}<Spinner data-icon="inline-start" />{/if}
          {isPublished && !isScheduled ? "Publish changes" : "Publish now"}
        </Button>
        <Field.Field>
          <Field.FieldLabel for="post-publish-at">Publish date</Field.FieldLabel>
          <DateTimePicker id="post-publish-at" bind:value={publishAt} placeholder="Pick a date" />
          <Field.FieldDescription>A future date schedules the post. Past dates backdate it.</Field.FieldDescription>
        </Field.Field>
        <Button variant="secondary" onclick={() => publish(publishAt)} disabled={busy || !publishAt}>
          {publishAt && publishAt > new Date() ? "Schedule" : "Publish with this date"}
        </Button>
        {#if post.hasChanges}
          <Button variant="outline" onclick={discard} disabled={busy}>Discard unpublished changes</Button>
        {/if}
        {#if isPublished}
          <Button variant="outline" onclick={() => run(() => unpublishPost(id), "Post unpublished.")} disabled={busy}>
            {isScheduled ? "Cancel schedule" : "Unpublish"}
          </Button>
        {/if}
        <Button variant="ghost" class="text-destructive" onclick={() => (deleteOpen = true)} disabled={busy}>
          <Trash2Icon data-icon="inline-start" />Delete post
        </Button>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header><Card.Title>Details</Card.Title></Card.Header>
      <Card.Content>
        <Field.FieldGroup>
          <Field.Field>
            <Field.FieldLabel>Author</Field.FieldLabel>
            <UserChip profile={post.author} />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="post-slug">Slug</Field.FieldLabel>
            <Input
              id="post-slug"
              bind:value={fields.slug}
              maxlength={200}
              onblur={() => (fields.slug = slugify(fields.slug))} />
            <Field.FieldDescription>/newsroom/{fields.slug}</Field.FieldDescription>
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="post-type">Category</Field.FieldLabel>
            <Select.Root type="single" bind:value={fields.type}>
              <Select.Trigger id="post-type" class="w-full">{POST_TYPE_LABELS[fields.type]}</Select.Trigger>
              <Select.Content>
                {#each POST_TYPES as type (type)}
                  <Select.Item value={type}>{POST_TYPE_LABELS[type]}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="post-excerpt">Excerpt</Field.FieldLabel>
            <Textarea id="post-excerpt" bind:value={fields.excerpt} maxlength={280} rows={3} />
            <Field.FieldDescription>{fields.excerpt.length}/280, shown on cards.</Field.FieldDescription>
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="post-tags">Tags</Field.FieldLabel>
            <Input id="post-tags" bind:value={tagsInput} onchange={syncTags} placeholder="dungeons, update" />
            <Field.FieldDescription>Comma separated, up to 10.</Field.FieldDescription>
          </Field.Field>
          <Field.Field orientation="horizontal">
            <Switch id="post-featured" bind:checked={fields.featured} />
            <Field.FieldLabel for="post-featured">Pin to the top of the newsroom</Field.FieldLabel>
          </Field.Field>
        </Field.FieldGroup>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header><Card.Title>Hero image</Card.Title></Card.Header>
      <Card.Content class="flex flex-col gap-3">
        {#if fields.heroImage}
          <img
            src={fields.heroImage.url}
            alt={fields.heroImage.alt}
            width={fields.heroImage.width}
            height={fields.heroImage.height}
            class="aspect-video w-full rounded-lg border object-cover" />
          <Field.Field>
            <Field.FieldLabel for="post-hero-alt">Alt text</Field.FieldLabel>
            <Input id="post-hero-alt" bind:value={fields.heroImage.alt} maxlength={300} />
          </Field.Field>
        {/if}
        <div class="flex gap-2">
          <Button variant="outline" class="relative flex-1" disabled={heroUploading}>
            {#if heroUploading}<Spinner data-icon="inline-start" />{:else}<ImagePlusIcon
                data-icon="inline-start" />{/if}
            {fields.heroImage ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              aria-label="Upload hero image"
              class="absolute inset-0 cursor-pointer opacity-0"
              onchange={onHeroFile} />
          </Button>
          {#if fields.heroImage}
            <Button variant="ghost" onclick={() => (fields.heroImage = null)}>Remove</Button>
          {/if}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title>SEO</Card.Title>
        <Card.Description>Optional. Falls back to the title and excerpt.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Field.FieldGroup>
          <Field.Field>
            <Field.FieldLabel for="post-seo-title">Title</Field.FieldLabel>
            <Input id="post-seo-title" bind:value={fields.seoTitle} maxlength={70} placeholder={fields.title} />
          </Field.Field>
          <Field.Field>
            <Field.FieldLabel for="post-seo-description">Description</Field.FieldLabel>
            <Textarea
              id="post-seo-description"
              bind:value={fields.seoDescription}
              maxlength={160}
              rows={3}
              placeholder={fields.excerpt} />
          </Field.Field>
        </Field.FieldGroup>
      </Card.Content>
    </Card.Root>
  </aside>
</div>

<Sheet.Root bind:open={historyOpen}>
  <Sheet.Content class="w-full gap-0 overflow-y-auto sm:max-w-md">
    <Sheet.Header class="border-b">
      <Sheet.Title>History</Sheet.Title>
      <Sheet.Description>Every publish is kept. Restoring loads it into the editor.</Sheet.Description>
    </Sheet.Header>
    {#if historyOpen}
      <svelte:boundary>
        {#snippet pending()}<div class="flex justify-center p-6"><Spinner /></div>{/snippet}
        {const revisions = await listRevisions(id)}
        <ol class="flex flex-col divide-y">
          {#each revisions as revision (revision.id)}
            <li class="flex items-center justify-between gap-3 p-4">
              <div class="flex min-w-0 flex-col gap-1 text-sm">
                <span class="truncate font-medium">{revision.data.title}</span>
                <span class="text-muted-foreground">{formatDateTime(revision.createdAt)}</span>
                <UserChip profile={revision.publishedBy} class="text-muted-foreground" />
              </div>
              <Button variant="outline" size="sm" onclick={() => restore(revision.data)}>Restore</Button>
            </li>
          {:else}
            <li class="p-4 text-sm text-muted-foreground">Nothing has been published yet.</li>
          {/each}
        </ol>
      </svelte:boundary>
    {/if}
  </Sheet.Content>
</Sheet.Root>

<AlertDialog.Root bind:open={deleteOpen}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete this post?</AlertDialog.Title>
      <AlertDialog.Description>
        It disappears from the newsroom right away, along with its history. This can’t be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        onclick={() => {
          deleteOpen = false;
          void remove();
        }}>
        Delete
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
