<script lang="ts" generics="T">
  import { Notice } from "$lib/components/notices";
  import { Spinner } from "$ui/spinner";
  import type { Snippet } from "svelte";

  let { query, children }: { query: () => Promise<T>; children: Snippet<[T]> } = $props();
</script>

<svelte:boundary>
  {#snippet pending()}
    <Spinner class="mx-auto mt-4 size-6" />
  {/snippet}
  {#snippet failed(err, retry)}
    <Notice title="An unexpected error has occurred" type="error" error={err} {retry} />
  {/snippet}

  {@render children(await query())}
</svelte:boundary>
