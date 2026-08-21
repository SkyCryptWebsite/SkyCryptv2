<script lang="ts">
  import { cn } from "$utils.js";
  import { Dialog as DialogPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: DialogPrimitive.DescriptionProps = $props();
</script>

<DialogPrimitive.Description
  bind:ref
  data-slot="dialog-description"
  class={cn(
    "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
    className
  )}
  {...restProps} />
