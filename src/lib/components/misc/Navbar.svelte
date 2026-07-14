<script lang="ts">
  import { pushState, replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { getInternalState, getPreferences, getProfileContext } from "$ctx";
  import ScrollAreaPrimitive from "$lib/components/ScrollAreaPrimitive.svelte";
  import type { SectionName } from "$lib/sections/types";
  import { Button } from "$ui/button";
  import { Separator } from "$ui/separator";
  import ArrowBigLeft from "@lucide/svelte/icons/arrow-big-left";
  import ArrowBigRight from "@lucide/svelte/icons/arrow-big-right";
  import { ScrollArea } from "bits-ui";
  import { onDestroy, tick, type Snippet } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";

  const { children }: { children?: Snippet } = $props();

  const profile = $derived(getProfileContext().current);
  const preferences = getPreferences();
  const internalState = getInternalState();

  const apiSettings = $derived(Object.entries(profile?.apiSettings ?? {}).filter(([_, value]) => !value));
  const disabledApiSettings: string[] = $derived(apiSettings.map(([key]) => key));

  const filteredSectionOrderPreferences = $derived(
    preferences.sectionOrder.filter((section) => {
      if (section.name === "Inventory" && disabledApiSettings.includes("inventory")) {
        return false;
      }
      return true;
    })
  );

  const previousSection = $derived(
    filteredSectionOrderPreferences.find((_, index) => {
      return index === filteredSectionOrderPreferences.findIndex((s) => s.name === internalState.tabValue) - 1;
    })
  );

  const nextSection = $derived(
    filteredSectionOrderPreferences.find((_, index) => {
      return index === filteredSectionOrderPreferences.findIndex((s) => s.name === internalState.tabValue) + 1;
    })
  );

  let navbarElement = $state<HTMLDivElement | null>(null);
  let observer: IntersectionObserver;

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicOut
  });

  function handleSectionClick(sectionName: SectionName) {
    internalState.tabValue = sectionName;
    scrollToTab({ smooth: true });
    page.url.hash = sectionName;
    pushState("", page.state);
  }

  function scrollToTab({
    element,
    smooth = true,
    options,
    retries = 5
  }: {
    element?: HTMLElement | null;
    smooth?: boolean;
    options?: ScrollIntoViewOptions;
    retries?: number;
  } = {}) {
    const scrollOptions = options ?? {
      behavior: smooth ? "smooth" : "auto",
      block: "center",
      inline: "center"
    };

    const link = element ?? document.querySelector<HTMLAnchorElement>(`button[data-id="${internalState.tabValue}"]`);

    if (link == null) {
      // Button may not be in the DOM yet — bits-ui's ScrollArea.Viewport sometimes mounts children
      // a frame later than its root. Retry on rAF, bounded.
      if (retries > 0) {
        requestAnimationFrame(() => scrollToTab({ smooth, options, retries: retries - 1 }));
      }
      return;
    }

    link.scrollIntoView(scrollOptions);
  }

  function observerInit() {
    if (!navbarElement) {
      console.warn("Navbar element is not defined");
      return;
    }

    const parsedTop = parseInt(window.getComputedStyle(navbarElement).getPropertyValue("top"));
    const topValue = Number.isFinite(parsedTop) ? parsedTop : 0;

    observer = new IntersectionObserver(
      ([e]) => {
        // Check if the element has reached its sticky position by comparing
        // its actual top position to the CSS top value
        const hasReachedStickyPosition = e.boundingClientRect.top <= topValue;
        internalState.navbarPinned = hasReachedStickyPosition && e.intersectionRatio < 1;
      },
      {
        threshold: [1],
        rootMargin: `-${topValue + 1}px 0px` // shrink the viewport to element top value +1px to trigger observer when element has reach it's sticky position
      }
    );

    observer.observe(navbarElement);
  }

  function observerCleanup() {
    if (observer) observer.disconnect();
  }

  $effect(() => {
    if (!navbarElement) return;
    observerInit();
    return () => {
      observerCleanup();
    };
  });

  onDestroy(() => {
    observerCleanup();
  });

  // Effect to handle tab value changes and update URL.
  // Depends on filteredSectionOrderPreferences so it re-runs once the tab buttons populate,
  // since the target button is rendered from that list and may not exist on the initial mount tick.
  $effect(() => {
    if (!navbarElement || !internalState.tabValue) return;
    if (!filteredSectionOrderPreferences.some((s) => s.name === internalState.tabValue)) return;

    tick().then(() => {
      scrollToTab({ smooth: true });
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      replaceState("#" + internalState.tabValue, page.state);
    });
  });
</script>

<ScrollAreaPrimitive
  type="scroll"
  class="navbar group sticky! top-[calc(3rem+env(safe-area-inset-top,0))] z-30 overflow-clip"
  data-pinned={internalState.navbarPinned}
  bind:ref={navbarElement}
  orientation="horizontal">
  {#snippet viewportChildren()}
    <div class="mx-6 my-2 flex! flex-nowrap items-center gap-2 font-semibold whitespace-nowrap text-foreground/80">
      {#each filteredSectionOrderPreferences as section, index (index)}
        {const isActive = $derived(internalState.tabValue === section.name)}
        <Button
          class="relative isolate motion-preset-focus motion-preset-slide-right rounded-xl bg-transparent px-2 py-3 text-base font-semibold text-inherit motion-delay-[calc(sibling-index()*0.05s)] hover:bg-transparent data-[active=true]:text-foreground "
          data-id={section.name}
          data-active={isActive}
          onclick={() => handleSectionClick(section.name)}>
          {#if isActive}
            <div
              class="absolute inset-0 rounded-full bg-primary"
              in:send={{ key: "active-tab" }}
              out:receive={{ key: "active-tab" }}>
            </div>
          {/if}
          <span class="relative">
            {section.name?.replaceAll("_", " ")}
          </span>
        </Button>
      {/each}
    </div>
    <Separator class="bg-primary" orientation="horizontal" />
  {/snippet}

  <ScrollArea.Scrollbar
    orientation="horizontal"
    class="z-10 flex h-0.5 w-full origin-center translate-y-[-0.44rem] touch-none transition-all duration-300 ease-out select-none group-hover:h-2 group-hover:-translate-y-1">
    <ScrollArea.Thumb class="rounded-full bg-primary" />
  </ScrollArea.Scrollbar>
</ScrollAreaPrimitive>

<div class="flex flex-col flex-nowrap gap-y-5 px-4 pb-4 @[75rem]/parent:px-8 @[75rem]/parent:pb-8">
  {@render children?.()}

  <div class="flex items-center justify-between">
    {#if previousSection}
      <Button
        class="flex items-center justify-between text-lg"
        onclick={() => handleSectionClick(previousSection.name ?? filteredSectionOrderPreferences[0].name)}>
        <ArrowBigLeft class="fill-foreground" />
        {previousSection.name.replaceAll("_", " ")}
      </Button>
    {:else}
      <div></div>
    {/if}
    {#if nextSection}
      <Button
        class="flex items-center justify-between text-lg"
        onclick={() =>
          handleSectionClick(
            nextSection.name ?? filteredSectionOrderPreferences[filteredSectionOrderPreferences.length - 1].name
          )}>
        {nextSection.name.replaceAll("_", " ")}
        <ArrowBigRight class="fill-foreground" />
      </Button>
    {/if}
  </div>
</div>
