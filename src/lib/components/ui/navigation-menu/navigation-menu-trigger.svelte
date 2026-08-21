<script lang="ts" module>
  import { cn } from "$utils.js";
  import { tv } from "tailwind-variants";

  export const navigationMenuTriggerStyle = tv({
    base: "rounded-3xl px-4.5 py-2.5 text-sm font-medium transition-all hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-1 disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none"
  });
</script>

<script lang="ts">
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: NavigationMenuPrimitive.TriggerProps = $props();
</script>

<NavigationMenuPrimitive.Trigger
  bind:ref
  data-slot="navigation-menu-trigger"
  class={cn(navigationMenuTriggerStyle(), "group", className)}
  {...restProps}>
  {@render children?.()}
  <ChevronDownIcon
    class="relative top-px ml-1 size-3 transition duration-300 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180"
    aria-hidden="true" />
</NavigationMenuPrimitive.Trigger>
