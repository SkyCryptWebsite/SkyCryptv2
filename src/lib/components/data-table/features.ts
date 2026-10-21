import {
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures
} from "@tanstack/svelte-table";

// Admin tables paginate and sort on the server, so no client row models are registered.
export const features = tableFeatures({ columnVisibilityFeature, rowPaginationFeature, rowSortingFeature });

export type DataTableFeatures = typeof features;
