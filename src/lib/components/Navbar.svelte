<script lang="ts">
  import { Button, ScrollArea } from "bits-ui";
  import { onMount } from "svelte";

  const sections = [
    {
      title: "Armor",
      id: "Armor"
    },
    {
      title: "Weapons",
      id: "Weapons"
    },
    {
      title: "Accessories",
      id: "Accessories"
    },
    {
      title: "Pets",
      id: "Pets"
    },
    {
      title: "Inventory",
      id: "Inventory"
    },
    {
      title: "Skills",
      id: "Skills"
    },
    {
      title: "Dungeons",
      id: "Dungeons"
    },
    {
      title: "Slayer",
      id: "Slayer"
    },
    {
      title: "Minions",
      id: "Minions"
    },
    {
      title: "Bestiary",
      id: "Bestiary"
    },
    {
      title: "Collections",
      id: "Collections"
    },
    {
      title: "Crimson Isle",
      id: "Crimson_Isle"
    },
    {
      title: "Rift",
      id: "Rift"
    },
    {
      title: "Misc",
      id: "Misc"
    }
  ];
  const intersectingElements = new Map();

  let activeSection = $state(sections[0].id);
  let pinned = $state(false);

  function scrollToTab(smooth = true, element?: HTMLElement) {
    const link = element ?? document.querySelector<HTMLAnchorElement>(`[href="${location.hash}"]`);
    const scrollableParent = link?.parentElement?.parentElement as HTMLElement;

    if (link == null) {
      console.warn(`could not scroll to ${location.hash} tab because it does not exist`, link);
      return;
    }

    const behavior = smooth ? "smooth" : "auto";
    const left = link.offsetLeft + link.getBoundingClientRect().width / 2 - scrollableParent.getBoundingClientRect().width / 2;
    scrollableParent.scrollTo({ left, behavior });
  }

  // intersection observer to set the active section
  onMount(() => {
    const navBarLinks = document.querySelector(".navbar [data-scroll-area-viewport]")?.querySelectorAll<HTMLAnchorElement>("a") ?? [];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          intersectingElements.set(entry.target, entry.isIntersecting);
        }
        for (const [element, isIntersecting] of intersectingElements) {
          if (isIntersecting) {
            let newHash;
            newHash = "#" + element.id;
            history.replaceState({}, document.title, newHash);
            for (const link of navBarLinks) {
              if (link.hash === newHash) {
                activeSection = link.hash.slice(1);
                scrollToTab(true, link);
              }
            }
            break;
          }
        }
      },
      { rootMargin: "-12% 0px -25% 0px" }
    );

    const navbar = document.querySelector(".navbar") as HTMLElement;
    const observer = new IntersectionObserver(([e]) => (pinned = e.intersectionRatio < 1), {
      threshold: [1],
      rootMargin: `-${parseInt(window.getComputedStyle(navbar).getPropertyValue("top")) + 1}px 0px` // shrink the viewport to element top value +1px to trigger observer when element has reach it's sticky position
    });

    observer.observe(navbar);
    for (const section of document.querySelectorAll("section[id]")) {
      sectionObserver.observe(section);
    }

    return () => {
      sectionObserver.disconnect();
      observer.disconnect();
      intersectingElements.clear();
    };
  });
</script>

<ScrollArea.Root type="scroll" class="navbar group sticky top-[calc(3rem+env(safe-area-inset-top,0))] z-20" data-pinned={pinned}>
  <ScrollArea.Viewport>
    <ScrollArea.Content class="!flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap pb-2 font-semibold text-text/80">
      <div class="absolute bottom-[0.4375rem] z-[1] h-[2px] w-[calc(100%+0.5rem)] bg-icon"></div>
      <div class="absolute inset-0 bottom-2 group-data-[pinned=true]:bg-[#141414]/90"></div>
      {#each sections as section}
        <Button.Root href="#{section.id}" class="relative px-2 py-3 after:absolute after:left-0 after:top-full after:h-0 after:w-full after:origin-top after:rounded-full after:bg-icon after:transition-all after:duration-100 hover:after:top-[calc(100%-4px)] hover:after:h-2 data-[active=true]:text-text data-[active=true]:after:top-[calc(100%-4px)] data-[active=true]:after:h-2" data-active={section.id === activeSection}>
          {section.title}
        </Button.Root>
      {/each}
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="horizontal">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
