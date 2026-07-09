<script lang="ts">
  import { browser, dev } from "$app/environment";
  import { beforeNavigate, replaceState } from "$app/navigation";
  import { page, updated } from "$app/state";
  import { initDisabledPacks, initFavorites, initInternalState, initNewsroomNotifications, initPreferences, initRecentSearches, initTheme, PacksContext, setHoverContext, setMobileContext, setPacksContext } from "$ctx";
  import Header from "$lib/components/header/Header.svelte";
  import { CommandPalette, JsonLd, PerformanceMode } from "$lib/components/misc";
  import NewPostsNotifier from "$lib/components/newsroom/NewPostsNotifier.svelte";
  import ThemeEditor from "$lib/components/theme-editor/ThemeEditor.svelte";
  import { IsHover } from "$lib/hooks/is-hover.svelte";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { listLatestPostsForNotifications } from "$lib/shared/api/cms-api.remote";
  import { getPacks } from "$lib/shared/api/skycrypt-api.remote";
  import { parseThemeFromURL } from "$lib/shared/themes/sharing";
  import * as Drawer from "$ui/drawer";
  import { Separator } from "$ui/separator";
  import * as Sheet from "$ui/sheet";
  import Wifi from "@lucide/svelte/icons/wifi";
  import WifiOff from "@lucide/svelte/icons/wifi-off";
  import { Tooltip } from "bits-ui";
  import { mode, ModeWatcher, setMode } from "mode-watcher";
  import { onMount, type Snippet } from "svelte";
  import SvelteSeo from "svelte-seo";
  import { toast, Toaster, type ToasterProps } from "svelte-sonner";
  import { SvelteURLSearchParams } from "svelte/reactivity";
  import { writable } from "svelte/store";
  import "./layout.css";

  let { children }: { children: Snippet } = $props();
  let isMobile = $state(new IsMobile());
  let isHover = $state(new IsHover());
  let toastId: string | number = $state(0);
  let commandLoading = $state(false);
  const { ign } = $derived(page.params);
  const showNewsroomToast = $derived(page.url.pathname !== "/" && !page.url.pathname.startsWith("/newsroom"));
  const preferences = initPreferences();
  const themeContext = initTheme();
  const internalState = initInternalState();
  const position = writable<ToasterProps["position"]>("bottom-right");
  const theme = writable<ToasterProps["theme"]>("dark");
  const noEmbedUrls = ["/stats/", "/newsroom"];
  const packs = new PacksContext();
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://sky.shiiyu.moe/#website",
    name: "SkyCrypt",
    url: "https://sky.shiiyu.moe",
    description: "A beautiful site for sharing your SkyBlock profile 🍣",
    publisher: {
      "@type": "Organization",
      "@id": "https://sky.shiiyu.moe/#organization",
      name: "SkyCrypt",
      url: "https://sky.shiiyu.moe",
      logo: "https://sky.shiiyu.moe/img/app-icons/svg.svg"
    }
  } as const;

  function updateOnlineStatus() {
    toast.dismiss(toastId);
    toastId = toast.loading("Checking connection status...");

    setTimeout(() => {
      if (navigator.onLine) {
        toast.dismiss(toastId);

        toastId = toast.success("You are now online!", {
          icon: Wifi,
          description: "Connection has been restored!",
          duration: 5000
        });
      } else {
        toast.dismiss(toastId);

        toastId = toast.error("You are now offline!", {
          icon: WifiOff,
          description: "Please check your connection and try again.",
          duration: 5000
        });
      }
    }, 1000);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === preferences.keybind) {
      e.preventDefault();
      internalState.openCommand = true;
    }
    if (e.key.toLowerCase() === "p" && dev) {
      // toggle performance mode for testing
      preferences.performanceMode = !preferences.performanceMode;
    }
    if (e.key.toLowerCase() === "m" && dev) {
      // toggle minecraft styled tooltips for testing
      preferences.mctooltip = !preferences.mctooltip;
    }
    if (e.key.toLowerCase() === "t" && dev) {
      // toggle minecraft styled tooltips for testing
      setMode(mode.current === "light" ? "dark" : "light");
    }
  }

  initDisabledPacks();
  initFavorites();
  initNewsroomNotifications();
  initRecentSearches();
  setMobileContext(isMobile);
  setHoverContext(isHover);
  setPacksContext(packs);

  onMount(() => {
    if (window.innerWidth <= 600) {
      position.set("bottom-center");
    }
  });

  beforeNavigate(({ type }) => {
    if (type === "leave" || type === "link") return;

    commandLoading = true;

    setTimeout(() => {
      commandLoading = false;
      internalState.openCommand = false;
    }, 1000);
  });

  beforeNavigate(({ willUnload, to }) => {
    if (updated.current && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });

  $effect.pre(() => {
    const urlParams = new SvelteURLSearchParams(window.location.search);
    const themeParam = urlParams.get("theme");
    if (themeParam) {
      toast.promise(
        parseThemeFromURL(window.location.href)
          .then((decoded) => {
            if (decoded) {
              themeContext.saveTheme(decoded);
              internalState.themeEditorId = decoded.metadata.id;
              internalState.themeEditorOpen = true;
            }
          })
          .catch((err) => {
            console.error("Failed to decode theme from URL:", err);
          })
          .finally(() => {
            // Clean up URL to prevent re-parsing on reload
            urlParams.delete("theme");
            const newUrl = `${page.url.pathname}${urlParams.toString() ? "?" + urlParams.toString() : ""}${page.url.hash}`;
            // eslint-disable-next-line svelte/no-navigation-without-resolve
            replaceState(newUrl, page.state);
          }),
        {
          loading: "Importing theme...",
          success: "Theme imported successfully!",
          error: "Failed to import theme."
        }
      );
    }
    return () => {
      // Clean up URL on unmount just in case
      const urlParams = new SvelteURLSearchParams(window.location.search);
      if (urlParams.has("theme")) {
        urlParams.delete("theme");
        const newUrl = `${page.url.pathname}${urlParams.toString() ? "?" + urlParams.toString() : ""}${page.url.hash}`;
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        replaceState(newUrl, page.state);
      }
    };
  });

  $effect(() => {
    const query = getPacks();
    if (query.current) packs.packs = query.current;
  });

  let innerWidth = $state(0);
</script>

<ModeWatcher defaultMode="dark" defaultTheme="default" themeStorageKey="skycryptActiveTheme" darkClassNames={["dark"]} lightClassNames={["light"]} themeColors={{ dark: "#282828", light: "#dbdbdb" }} />

<svelte:document onkeydown={handleKeydown} />

<svelte:window
  onresize={() => {
    if (innerWidth <= 600) {
      position.set("bottom-center");
    } else {
      position.set("bottom-right");
    }
  }}
  bind:innerWidth
  ononline={updateOnlineStatus}
  onoffline={updateOnlineStatus} />

<svelte:head>
  {#if !noEmbedUrls.some((url) => page.url.pathname.startsWith(url))}
    <link rel="icon" href="/favicon.png" sizes="32x32" type="image/png" />
  {/if}
</svelte:head>

{#if !noEmbedUrls.some((url) => page.url.pathname.startsWith(url))}
  <SvelteSeo
    title="SkyCrypt"
    description="A beautiful site for sharing your SkyBlock profile 🍣"
    canonical="https://sky.shiiyu.moe/"
    openGraph={{
      title: "SkyBlock Stats",
      description: "A beautiful site for sharing your SkyBlock profile 🍣",
      site_name: "SkyCrypt",
      // @ts-expect-error It accepts any property
      image: "/img/app-icons/svg.svg"
    }}
    manifest="/manifest.webmanifest" />
  <JsonLd data={websiteJsonLd} />
{/if}

<Toaster
  theme={$theme}
  closeButton={isHover.current}
  position={$position}
  class="sm:mr-8"
  pauseWhenPageIsHidden={true}
  toastOptions={{
    class: "standard:glass! performance:bg-popover! gap-2! rounded-xl! border! text-foreground!",

    classes: {
      closeButton: "bg-secondary!",
      description: "text-pretty!",
      title: "text-pretty!"
    }
  }} />

{#if page.url.origin.includes("cupcake") || dev}
  {#await import("$lib/components/notices/BetaNotice.svelte") then { default: BetaNotice }}
    <BetaNotice />
  {/await}
{/if}

{#if browser && !preferences.performanceMode}
  <PerformanceMode />
{/if}

<div class="pointer-events-none fixed inset-0 group z-[-1] isolate h-dvh w-screen" data-isSkinHidden={innerWidth < 1210} data-isStatsPage={page.url.pathname.startsWith("/stats") && !page.error}>
  <div class="size-full relative z-10 group-data-[isSkinHidden=true]:group-data-[isStatsPage=true]:blur-lg [background-image:var(--bg-url)] bg-cover bg-scroll bg-center bg-no-repeat bg-background"></div>

  <div class="absolute inset-0 size-full z-20 group-data-[skinHidden=true]:hidden group-data-[isStatsPage=false]:hidden [background-image:var(--bg-url)] blur-lg bg-cover bg-scroll bg-center bg-no-repeat" style="--percent: 30%; clip-path: polygon(var(--percent) 0%, 100% 0%, 100% 100%, var(--percent) 100%);"></div>
  <Separator class="absolute inset-0 h-screen top-12 left-[calc(30%-1px)] z-50 group-data-[isSkinHidden=true]:hidden group-data-[isStatsPage=false]:hidden" orientation="vertical" />
</div>

<Header />
{#if showNewsroomToast}
  <svelte:boundary>
    {#snippet failed()}{/snippet}
    {const latestNewsroom = await listLatestPostsForNotifications({ limit: 5 })}
    {#if latestNewsroom}
      <NewPostsNotifier posts={latestNewsroom.docs} />
    {/if}
  </svelte:boundary>
{/if}
<Tooltip.Provider delayDuration={0}>
  {@render children()}
</Tooltip.Provider>

<CommandPalette {ign} bind:loading={commandLoading} />

{#if !isMobile.current}
  <Sheet.Root bind:open={internalState.themeEditorOpen}>
    <Sheet.Content side="left" class="h-[calc(100%-3rem)]! *:data-dialog-close:bg-transparent *:data-dialog-close:border *:data-dialog-close:border-border top-12! overflow-y-auto p-4 glass-bg-popover w-[30%]! glass standard:bg-transparent! max-w-none!" showOverlay={false} escapeKeydownBehavior="ignore" interactOutsideBehavior="ignore" preventScroll={false}>
      <ThemeEditor />
    </Sheet.Content>
  </Sheet.Root>
{/if}

{#if isMobile.current}
  <Drawer.Root bind:open={internalState.themeEditorOpen} shouldScaleBackground={true}>
    <Drawer.Content class="before:glass before:glass-bg-popover [&>div:first-child]:my-4 before:bg-transparent">
      <div class="overflow-auto p-4">
        <ThemeEditor />
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}

{#if !isHover.current}
  <Drawer.Root
    bind:open={() => !!internalState.content, (v) => v}
    shouldScaleBackground={false}
    setBackgroundColorOnScale={false}
    onOpenChange={(open) => {
      if (!open) internalState.content = undefined;
    }}>
    <Drawer.Content class="before:glass before:glass-bg-popover before:bg-transparent">
      <div class="mx-auto w-full overflow-auto p-6">
        {@render internalState.content?.()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
