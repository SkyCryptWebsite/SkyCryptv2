<script lang="ts">
  import { ScrollArea } from "$ui/scroll-area";
  import { cn } from "$utils";
  import type { ScrollAreaRootProps, ScrollAreaScrollbarProps } from "bits-ui";
  import type { Snippet } from "svelte";

  type Props = ScrollAreaRootProps & {
    children: Snippet;
    class?: string;
    orientation?: ScrollAreaScrollbarProps["orientation"];
    viewportClasses?: string;
    border?: boolean;
  };

  let {
    children,
    class: className,
    orientation = "vertical",
    viewportClasses,
    border = false,
    ref = $bindable(null),
    type = "auto",
    ...restProps
  }: Props = $props();

  let viewportRef = $state<ScrollAreaRootProps["ref"]>(null);

  const handleWheel = (e: WheelEvent) => {
    if (!viewportRef) return;

    const maxScroll = viewportRef.scrollWidth - viewportRef.clientWidth;
    const atRightEdge = viewportRef.scrollLeft >= maxScroll - 1;
    const atLeftEdge = viewportRef.scrollLeft <= 1;

    const scrollAmount = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

    if (atRightEdge && scrollAmount > 0) return;
    if (atLeftEdge && scrollAmount < 0) return;

    e.preventDefault();
    viewportRef.scrollLeft += scrollAmount;
  };

  $effect(() => {
    if (viewportRef && orientation === "horizontal") {
      viewportRef.addEventListener("wheel", handleWheel, { passive: false });

      // Svelte 5 automatically runs the returned function when the effect destroys/re-runs
      return () => {
        viewportRef?.removeEventListener("wheel", handleWheel);
      };
    }
  });
</script>

<ScrollArea
  bind:ref
  bind:viewportRef
  class={cn(
    "data-[orientation=vertical]/scroll:w-fit data-[orientation=horizontal]/scroll:max-w-full group/scroll h-fit",
    { "rounded-xl border": border },
    className
  )}
  {type}
  {orientation}
  scrollbarYClasses="py-2"
  scrollbarXClasses="px-2"
  viewportClasses={cn(
    "rounded-xl group-data-[orientation=horizontal]/scroll:w-full group-data-[orientation=horizontal]/scroll:scroll-fade-track-x group-data-[orientation=vertical]/scroll:h-full group-data-[orientation=vertical]/scroll:max-h-144 group-data-[orientation=vertical]/scroll:scroll-fade-track-y",
    viewportClasses
  )}
  data-orientation={orientation}
  {...restProps}>
  <div
    class="relative flex gap-2 pt-4 group-data-[orientation=horizontal]/scroll:w-max group-data-[orientation=horizontal]/scroll:flex-nowrap group-data-[orientation=vertical]/scroll:flex-wrap sm:gap-4">
    {@render children?.()}
    <div
      class="pointer-events-none sticky -right-1 z-10 -ml-40 w-36 self-stretch bg-linear-to-l from-background/80 to-transparent scroll-fade-x blur-xs group-data-[orientation=vertical]/scroll:hidden">
    </div>
  </div>
  <div
    class="pointer-events-none sticky -bottom-1 z-10 -mt-36 h-36 w-full bg-linear-to-t from-background/80 to-transparent scroll-fade-y blur-xs group-data-[orientation=horizontal]/scroll:hidden">
  </div>
</ScrollArea>
