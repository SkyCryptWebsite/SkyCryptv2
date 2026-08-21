<script lang="ts">
  import { cn } from "$src/lib/shared/utils";
  import * as Empty from "$ui/empty";
  import { type Icon as IconType } from "@lucide/svelte";

  type Props = {
    title: string;
    description?: string;
    icon: typeof IconType;
    class?: string;
  };

  const { title, description, icon: IconComponent, class: classList }: Props = $props();
</script>

<Empty.Root class={cn("rounded-xl border", classList)}>
  <Empty.Header>
    <Empty.Media variant="icon" class="border bg-transparent">
      <IconComponent />
    </Empty.Media>
    <Empty.Title>{title}</Empty.Title>
    {#if description}
      <Empty.Description>{description}</Empty.Description>
    {/if}
  </Empty.Header>
</Empty.Root>
