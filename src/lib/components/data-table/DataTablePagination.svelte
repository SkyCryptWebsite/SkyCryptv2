<script lang="ts" generics="TData extends RowData">
  import { Button } from "$ui/button";
  import { Label } from "$ui/label";
  import * as Select from "$ui/select";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import ChevronsLeftIcon from "@lucide/svelte/icons/chevrons-left";
  import ChevronsRightIcon from "@lucide/svelte/icons/chevrons-right";
  import type { RowData, SvelteTable } from "@tanstack/svelte-table";
  import { PAGE_SIZES } from "#lib/shared/admin";
  import type { DataTableFeatures } from "./features";

  let { table, rowCount }: { table: SvelteTable<DataTableFeatures, TData>; rowCount: number } = $props();

  const pagination = $derived(table.atoms.pagination.get());
  const pageCount = $derived(Math.max(1, table.getPageCount()));
  const id = $props.id();
</script>

<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-1">
  <p class="text-sm text-muted-foreground tabular-nums" aria-live="polite">
    {rowCount.toLocaleString("en-US")}
    {rowCount === 1 ? "result" : "results"}
  </p>
  <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
    <div class="flex items-center gap-2">
      <Label for="{id}-size" class="text-sm font-medium">Rows per page</Label>
      <Select.Root
        type="single"
        value={String(pagination.pageSize)}
        onValueChange={(value) => table.setPageSize(Number(value))}>
        <Select.Trigger id="{id}-size" size="sm" class="w-20">{pagination.pageSize}</Select.Trigger>
        <Select.Content side="top">
          {#each PAGE_SIZES as size (size)}
            <Select.Item value={String(size)} label={String(size)}>{size}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
    <p class="text-sm font-medium tabular-nums">Page {pagination.pageIndex + 1} of {pageCount}</p>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        class="hidden lg:inline-flex"
        aria-label="First page"
        disabled={!table.getCanPreviousPage()}
        onclick={() => table.firstPage()}>
        <ChevronsLeftIcon />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Previous page"
        disabled={!table.getCanPreviousPage()}
        onclick={() => table.previousPage()}>
        <ChevronLeftIcon />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Next page"
        disabled={!table.getCanNextPage()}
        onclick={() => table.nextPage()}>
        <ChevronRightIcon />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        class="hidden lg:inline-flex"
        aria-label="Last page"
        disabled={!table.getCanNextPage()}
        onclick={() => table.lastPage()}>
        <ChevronsRightIcon />
      </Button>
    </div>
  </div>
</div>
