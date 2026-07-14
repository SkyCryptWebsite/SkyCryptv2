<script lang="ts">
  import { Button } from "$ui/button";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronsLeft from "@lucide/svelte/icons/chevrons-left";
  import ChevronsRight from "@lucide/svelte/icons/chevrons-right";

  interface Props {
    page: number;
    totalPages: number;
    baseHref: string;
  }

  let { page, totalPages, baseHref }: Props = $props();

  const hrefFor = (n: number) => {
    if (n <= 1) return baseHref;
    const sep = baseHref.includes("?") ? "&" : "?";
    return `${baseHref}${sep}page=${n}`;
  };

  const atFirst = $derived(page <= 1);
  const atLast = $derived(page >= totalPages);
</script>

{#if totalPages > 1}
  <nav aria-label="Pagination" class="flex items-center justify-end gap-1">
    <span class="px-4 text-sm font-semibold text-muted-foreground tabular-nums">
      Page <span class="font-bold text-foreground">{page}</span> of
      <span class="font-bold text-foreground">{totalPages}</span>
    </span>

    <Button
      href={atFirst ? undefined : hrefFor(1)}
      aria-disabled={atFirst}
      aria-label="First page"
      data-sveltekit-preload-data="hover"
      variant="outline">
      <ChevronsLeft class="size-4" />
    </Button>
    <Button
      href={atFirst ? undefined : hrefFor(page - 1)}
      aria-disabled={atFirst}
      aria-label="Previous page"
      data-sveltekit-preload-data="hover"
      variant="outline">
      <ChevronLeft class="size-4" />
    </Button>
    <Button
      href={atLast ? undefined : hrefFor(page + 1)}
      aria-disabled={atLast}
      aria-label="Next page"
      data-sveltekit-preload-data="hover"
      variant="outline">
      <ChevronRight class="size-4" />
    </Button>
    <Button
      href={atLast ? undefined : hrefFor(totalPages)}
      aria-disabled={atLast}
      aria-label="Last page"
      data-sveltekit-preload-data="hover"
      variant="outline">
      <ChevronsRight class="size-4" />
    </Button>
  </nav>
{/if}
