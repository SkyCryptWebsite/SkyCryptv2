<script lang="ts">
  import { cn } from "$lib/shared/utils";
  import { Label } from "$ui/label";
  import { Switch } from "$ui/switch";
  import type { Snippet } from "svelte";

  let {
    icon,
    title,
    description,
    checked,
    disabled = false,
    id,
    onCheckedChange,
    children,
    titleClass = ""
  }: {
    icon: Snippet;
    title: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    id: string;
    onCheckedChange: () => void;
    children?: Snippet;
    titleClass?: string;
  } = $props();
</script>

<Label for={id} class="flex items-center justify-between gap-4 rounded-xl border p-2">
  <div class="flex flex-col items-start gap-2">
    <div class="flex items-center-safe gap-1">
      {@render icon()}
      <h4 class={cn("font-semibold", titleClass)}>{title}</h4>
      {@render children?.()}
    </div>
    <p class="text-muted-foreground">{description}</p>
  </div>

  <Switch {id} {checked} {disabled} {onCheckedChange} />
</Label>
