<script lang="ts">
  import { cn } from "$utils.js";
  import { Select as SelectPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: SelectPrimitive.GroupProps = $props();
</script>

<SelectPrimitive.Group bind:ref data-slot="select-group" class={cn("scroll-my-1.5 p-1.5", className)} {...restProps} />
