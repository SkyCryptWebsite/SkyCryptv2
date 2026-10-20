<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import { Spinner } from "$ui/spinner";
  import * as Tabs from "$ui/tabs";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { createColumnHelper, renderComponent, renderSnippet } from "@tanstack/svelte-table";
  import { toast } from "svelte-sonner";
  import DataTable from "#lib/components/data-table/DataTable.svelte";
  import DataTableSearch from "#lib/components/data-table/DataTableSearch.svelte";
  import type { DataTableFeatures } from "#lib/components/data-table/features";
  import UserChip from "#lib/components/misc/UserChip.svelte";
  import TypeBadge from "#lib/components/newsroom/TypeBadge.svelte";
  import { useSearchParams } from "#lib/hooks/search-params.svelte.js";
  import { POST_FILTERS } from "#lib/shared/newsroom";
  import { formatDateTime } from "../format";
  import PostStatus from "./post-status.svelte";
  import { createPost, listPosts } from "./posts.remote";

  const params = useSearchParams({ page: 1, size: 25, q: "", status: "all" as (typeof POST_FILTERS)[number] });
  const args = $derived(params.current);
  const data = $derived(await listPosts(args));
  const loading = $derived($effect.pending() > 0);
  let creating = $state(false);

  type Row = (typeof data.rows)[number];
  const editHref = (id: string) => resolve("/(protected)/(admin)/admin-dashboard/posts/[id]", { id });

  const column = createColumnHelper<DataTableFeatures, Row>();
  const columns = column.columns([
    column.accessor("title", { header: "Title", cell: ({ row }) => renderSnippet(titleCell, row.original) }),
    column.accessor("type", {
      header: "Type",
      cell: ({ getValue }) => renderComponent(TypeBadge, { type: getValue() })
    }),
    column.accessor("status", { header: "Status", cell: ({ row }) => renderComponent(PostStatus, row.original) }),
    column.accessor("authorId", {
      header: "Author",
      cell: ({ row }) => renderComponent(UserChip, { profile: row.original.author })
    }),
    column.accessor("updatedAt", { header: "Last edited", cell: ({ getValue }) => formatDateTime(getValue()) })
  ]);

  async function newPost() {
    creating = true;
    try {
      await goto(editHref(await createPost()));
    } catch {
      toast.error("Unable to create a post. Please try again.");
    } finally {
      creating = false;
    }
  }
</script>

{#snippet titleCell(row: Row)}
  <div class="flex min-w-0 flex-col">
    <a class="truncate font-medium underline-offset-4 hover:underline" href={editHref(row.id)}>
      {row.title || "Untitled post"}
    </a>
    <span class="truncate text-xs text-muted-foreground">/newsroom/{row.slug}</span>
  </div>
  {#if row.featured}<Badge variant="outline" class="ms-2">Featured</Badge>{/if}
{/snippet}

<svelte:head>
  <title>Posts | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
  <div class="flex flex-col gap-1">
    <h1 class="text-2xl font-semibold tracking-tight">Posts</h1>
    <p class="text-sm text-muted-foreground">Write, schedule and publish newsroom posts.</p>
  </div>
  <Button onclick={newPost} disabled={creating}>
    {#if creating}<Spinner data-icon="inline-start" />{:else}<PlusIcon data-icon="inline-start" />{/if}
    New post
  </Button>
</div>

<div class="flex flex-col gap-4">
  <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
    <Tabs.Root value={args.status} onValueChange={(status) => params.set({ status: status as typeof args.status })}>
      <Tabs.List>
        {#each POST_FILTERS as status (status)}
          <Tabs.Trigger value={status} class="capitalize">{status}</Tabs.Trigger>
        {/each}
      </Tabs.List>
    </Tabs.Root>
    <DataTableSearch
      value={args.q}
      onSearch={(q) => params.set({ q })}
      placeholder="Search titles or slugs…"
      label="Search posts" />
  </div>

  <DataTable
    caption="Newsroom posts"
    {columns}
    data={data.rows}
    rowCount={data.total}
    page={args.page}
    size={args.size}
    {loading}
    getRowId={(row) => row.id}
    onPageChange={(page, size) => params.set({ page, size })}
    onRowClick={(row) => goto(editHref(row.id))}
    empty="No posts match these filters." />
</div>
