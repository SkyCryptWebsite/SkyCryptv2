<script lang="ts">
  import { Badge } from "$ui/badge";
  import { formatDateTime } from "../format";

  type Props = { status: "draft" | "published"; publishedAt: Date | null; hasChanges: boolean };
  let { status, publishedAt, hasChanges }: Props = $props();

  const scheduled = $derived(status === "published" && !!publishedAt && publishedAt > new Date());
</script>

<div class="flex flex-wrap items-center gap-1.5">
  {#if status === "draft"}
    <Badge variant="outline">Draft</Badge>
  {:else if scheduled && publishedAt}
    <Badge variant="secondary" title="Goes live {formatDateTime(publishedAt)}">Scheduled</Badge>
  {:else}
    <Badge>Published</Badge>
  {/if}
  {#if hasChanges}<Badge variant="outline">Unpublished changes</Badge>{/if}
</div>
