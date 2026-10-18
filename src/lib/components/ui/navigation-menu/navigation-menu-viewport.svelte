<script lang="ts">
  import { cn } from "$utils.js";
  import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";

  let { ref = $bindable(null), class: className, ...restProps }: NavigationMenuPrimitive.ViewportProps = $props();
</script>

<div class={cn("absolute start-0 top-full isolate z-50 flex justify-center")}>
  <NavigationMenuPrimitive.Viewport
    bind:ref
    data-slot="navigation-menu-viewport"
    class={cn(
      "origin-top-center relative mt-1.5 w-full overflow-hidden rounded-3xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 dark:ring-foreground/10 data-open:animate-in data-open:zoom-in-90 data-closed:animate-out data-closed:zoom-out-90",
      "h-[calc(var(--bits-navigation-menu-viewport-height)_+_1rem)] md:w-[calc(var(--bits-navigation-menu-viewport-width)_+_1rem)]",
      className
    )}
    {...restProps} />
</div>
