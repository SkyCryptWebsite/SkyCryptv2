<script lang="ts">
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import { getInternalState, getThemeContext } from "$ctx";
  import Settings from "$lib/components/header/settings";
  import { getThemeIcons } from "$lib/shared/api/themes.remote";
  import { readComputedThemeCssVars } from "$lib/shared/themes/computed-css-vars";
  import type { ThemeModeName } from "$lib/shared/themes/schema";
  import Menu from "$src/lib/components/header/Menu.svelte";
  import { Button as ShadcnButton } from "$ui/button";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SunIcon from "@lucide/svelte/icons/sun";
  import SunMoonIcon from "@lucide/svelte/icons/sun-moon";
  import { Avatar, Button } from "bits-ui";
  import { mode, resetMode, toggleMode, userPrefersMode } from "mode-watcher";

  const internalState = getInternalState();
  const theme = getThemeContext();
  const themeIconColor = $derived.by(() => {
    const computedCssVars = readComputedThemeCssVars();
    const modeName: ThemeModeName = mode.current === "light" ? "light" : "dark";
    const themeCssVars = theme.activeTheme?.modes[modeName].cssVars;
    return themeCssVars?.sidebarPrimary ?? themeCssVars?.chart2 ?? themeCssVars?.primary ?? computedCssVars.sidebarPrimary ?? computedCssVars.chart2 ?? computedCssVars.primary;
  });
  const themeIconQuery = $derived(getThemeIcons({ color: themeIconColor, invert: mode.current === "light" }));

  const packageVersion = __NPM_PACKAGE_VERSION__;

  const pinnedClipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 30% 100%, 30% 47.5%, 0% 47.5%);";
  const normalClipPath = "polygon(0% 0%, 100% 0%, 100% 47.5%, 30% 47.5%, 30% 47.5%, 0% 47.5%);";
  const skinHiddenClipPath = $derived(internalState.navbarPinned ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);" : "polygon(0% 0%, 100% 0%, 100% 47.5%, 0% 47.5%);");

  let innerWidth = $state(0);

  const clipPath = $derived.by(() => {
    if (innerWidth < 1210) return skinHiddenClipPath;
    return internalState.navbarPinned ? pinnedClipPath : normalClipPath;
  });
</script>

<svelte:window bind:innerWidth />

<div class="invisible h-12 w-full"></div>
<div class="fixed top-0 left-0 z-30 w-full transition-[clip-path] duration-150 ease-out pointer-events-auto h-25.25 glass glass-bg-popover" style="clip-path: {clipPath}"></div>
<header class="@container fixed top-0 border-b left-0 z-35 isolate h-12 w-full px-2.5 pt-[env(safe-area-inset-top,0)] pr-[max(0.625rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom,0)] pl-[max(0.625rem,env(safe-area-inset-left))] leading-12">
  <div class="flex h-full w-full items-center-safe justify-between">
    <div class="flex gap-2">
      <Button.Root href="/" class="flex items-center-safe justify-center-safe gap-2 font-bold" data-sveltekit-preload-data="hover">
        <Avatar.Root class="size-6 shrink-0 rounded-lg select-none">
          {#if themeIconQuery.current}
            <Avatar.Image loading="lazy" src="data:image/svg+xml;base64,{btoa(themeIconQuery.current)}" alt="SkyCrypt" class="pointer-events-none h-6 select-none" />
          {:else}
            <Avatar.Image loading="lazy" src="/img/app-icons/svg.svg" alt="SkyCrypt" class="pointer-events-none h-6 select-none" />
          {/if}

          <Avatar.Fallback class="flex h-full items-center justify-center text-lg font-semibold text-text/60 uppercase">SC</Avatar.Fallback>
        </Avatar.Root>
      </Button.Root>
      <div class="flex flex-col items-start justify-center-safe gap-1">
        <Button.Root href="/" class="leading-none font-bold text-nowrap" data-sveltekit-preload-data="hover">
          SkyCrypt
          {#if page.url.origin.includes("cupcake") || dev}
            Beta
          {/if}
        </Button.Root>

        {#if packageVersion}
          <Button.Root class="text-xs leading-none font-normal text-text/60 transition-colors hover:text-primary/60 data-[cupcake=true]:text-yellow-500/60 data-[cupcake=true]:hover:text-yellow-500" rel="noreferrer" href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/releases/tag/v{packageVersion}" target="_blank" data-cupcake={page.url.origin.includes("cupcake") || dev}>v{packageVersion}</Button.Root>
        {/if}
      </div>
    </div>

    <Menu />

    <div class="flex gap-1">
      <ShadcnButton variant="outline" onclick={toggleMode} ondblclick={resetMode}>
        {#if userPrefersMode.current === "system"}
          <SunMoonIcon />
        {:else if userPrefersMode.current === "dark"}
          <MoonIcon />
        {:else if userPrefersMode.current === "light"}
          <SunIcon />
        {/if}
      </ShadcnButton>
      <Settings />
    </div>
  </div>
</header>
