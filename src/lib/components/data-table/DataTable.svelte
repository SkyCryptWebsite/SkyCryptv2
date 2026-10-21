<script lang="ts" generics="TData extends RowData">
  import * as Table from "$ui/table";
  import { cn } from "$utils";
  import {
    createTable,
    FlexRender,
    type ColumnDef,
    type PaginationState,
    type RowData,
    type SortingState,
    type Updater
  } from "@tanstack/svelte-table";
  import DataTablePagination from "./DataTablePagination.svelte";
  import { features, type DataTableFeatures } from "./features";

  type Props = {
    columns: ColumnDef<DataTableFeatures, TData>[];
    data: TData[];
    /** Total rows on the server, across all pages. */
    rowCount: number;
    /** 1-based, matching the URL. */
    page: number;
    size: number;
    onPageChange: (page: number, size: number) => void;
    sorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
    getRowId?: (row: TData) => string;
    /** Mouse shortcut only; keep a focusable link or button in the row for keyboard users. */
    onRowClick?: (row: TData) => void;
    empty?: string;
    /** Dims the rows while the next page loads. */
    loading?: boolean;
    caption: string;
  };

  let {
    columns,
    data,
    rowCount,
    page,
    size,
    onPageChange,
    sorting = [],
    onSortingChange,
    getRowId,
    onRowClick,
    empty = "No results.",
    loading = false,
    caption
  }: Props = $props();

  const resolve = <T>(updater: Updater<T>, current: T) =>
    typeof updater === "function" ? (updater as (old: T) => T)(current) : updater;

  const table = createTable({
    features,
    get data() {
      return data;
    },
    get columns() {
      return columns;
    },
    get rowCount() {
      return rowCount;
    },
    get getRowId() {
      return getRowId && ((row: TData) => getRowId(row));
    },
    manualPagination: true,
    manualSorting: true,
    state: {
      get pagination(): PaginationState {
        return { pageIndex: page - 1, pageSize: size };
      },
      get sorting() {
        return sorting;
      }
    },
    onPaginationChange: (updater) => {
      const next = resolve(updater, { pageIndex: page - 1, pageSize: size });
      onPageChange(next.pageIndex + 1, next.pageSize);
    },
    onSortingChange: (updater) => onSortingChange?.(resolve(updater, sorting))
  });
</script>

<div class="flex flex-col gap-4">
  <div class="overflow-hidden rounded-lg border">
    <Table.Root>
      <Table.Caption class="sr-only">{caption}</Table.Caption>
      <Table.Header class="bg-muted/50">
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head colspan={header.colSpan}>
                {#if !header.isPlaceholder}<FlexRender {header} />{/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body class={cn("transition-opacity", loading && "opacity-60")} aria-busy={loading}>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row
            class={cn(onRowClick && "cursor-pointer")}
            onclick={(event) => {
              // Let links, buttons and menus inside the row handle their own clicks.
              if (!(event.target as HTMLElement).closest("a, button, [role=menuitem]")) onRowClick?.(row.original);
            }}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell><FlexRender {cell} /></Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">{empty}</Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
  <DataTablePagination {table} {rowCount} />
</div>
