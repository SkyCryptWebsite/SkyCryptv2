<script lang="ts">
  import { cn } from "$utils.js";
  import { Avatar as AvatarPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: AvatarPrimitive.FallbackProps = $props();
</script>

<AvatarPrimitive.Fallback
  bind:ref
  data-slot="avatar-fallback"
  class={cn(
    "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
    className
  )}
  {...restProps} />
