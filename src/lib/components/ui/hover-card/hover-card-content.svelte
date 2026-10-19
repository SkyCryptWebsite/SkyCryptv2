<script lang="ts">
  import { cn, type WithoutChildrenOrChild } from "$utils.js";
  import { LinkPreview as HoverCardPrimitive } from "bits-ui";
  import type { ComponentProps } from "svelte";
  import HoverCardPortal from "./hover-card-portal.svelte";

  let {
    ref = $bindable(null),
    class: className,
    side = "bottom",
    sideOffset = 4,
    align = "center",
    portalProps,
    ...restProps
  }: HoverCardPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof HoverCardPortal>>;
  } = $props();
</script>

<HoverCardPortal {...portalProps}>
  <HoverCardPrimitive.Content
    bind:ref
    data-slot="hover-card-content"
    {side}
    {sideOffset}
    {align}
    class={cn(
      "z-50 w-72 origin-(--bits-link-preview-content-transform-origin) rounded-3xl bg-popover p-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/5 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
      className
    )}
    {...restProps} />
</HoverCardPortal>
