<script lang="ts">
  import { Button } from "$ui/button";
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";

  type Props = { label: string; direction: "asc" | "desc" | false; onclick: (event: MouseEvent) => void };

  let { label, direction, onclick }: Props = $props();
</script>

<Button variant="ghost" size="sm" class="-ms-2.5 h-8" {onclick}>
  {label}
  {#if direction === "asc"}<ArrowUpIcon />{:else if direction === "desc"}<ArrowDownIcon />{:else}<ArrowUpDownIcon
      class="text-muted-foreground" />{/if}
  <span class="sr-only">
    {direction ? `, sorted ${direction === "asc" ? "ascending" : "descending"}` : ", not sorted"}
  </span>
</Button>
