<script lang="ts">
  import { dev } from "$app/env";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { getInternalState, getThemeContext } from "$ctx";
  import Menu from "$src/lib/components/header/Menu.svelte";
  import * as AvatarUI from "$ui/avatar";
  import { buttonVariants } from "$ui/button";
  import * as DropdownMenu from "$ui/dropdown-menu";
  import LogInIcon from "@lucide/svelte/icons/log-in";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SunIcon from "@lucide/svelte/icons/sun";
  import SunMoonIcon from "@lucide/svelte/icons/sun-moon";
  import { Avatar, Button } from "bits-ui";
  import { mode, resetMode, setMode, userPrefersMode } from "mode-watcher";
  import Settings from "#lib/components/header/settings";
  import { getThemeIcons } from "#lib/shared/api/themes.remote";
  import { isBeta } from "#lib/shared/release-channel";
  import { getHeaderUser } from "#lib/shared/session.remote";
  import { readComputedThemeCssVars } from "#lib/shared/themes/computed-css-vars";
  import type { ThemeModeName } from "#lib/shared/themes/schema";

  const internalState = getInternalState();
  const theme = getThemeContext();
  const themeIconColor = $derived.by(() => {
    const computedCssVars = readComputedThemeCssVars();
    const modeName: ThemeModeName = mode.current === "light" ? "light" : "dark";
    const themeCssVars = theme.activeTheme?.modes[modeName].cssVars;

    return (
      themeCssVars?.sidebarPrimary ??
      themeCssVars?.chart2 ??
      themeCssVars?.primary ??
      computedCssVars.sidebarPrimary ??
      computedCssVars.chart2 ??
      computedCssVars.primary
    );
  });
  const themeIconQuery = $derived(getThemeIcons({ color: themeIconColor, invert: mode.current === "light" }));

  const packageVersion = __NPM_PACKAGE_VERSION__;

  const pinnedClipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 30% 100%, 30% 47.5%, 0% 47.5%);";
  const normalClipPath = "polygon(0% 0%, 100% 0%, 100% 47.5%, 30% 47.5%, 30% 47.5%, 0% 47.5%);";
  const skinHiddenClipPath = $derived(
    internalState.navbarPinned
      ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);"
      : "polygon(0% 0%, 100% 0%, 100% 47.5%, 0% 47.5%);"
  );

  let innerWidth = $state(0);

  const clipPath = $derived.by(() => {
    if (innerWidth < 1210) return skinHiddenClipPath;
    if (!page.url.pathname.startsWith("/stats")) return normalClipPath;
    return internalState.navbarPinned ? pinnedClipPath : normalClipPath;
  });
</script>

<svelte:window bind:innerWidth />

{#snippet loginButton()}
  <a href={resolve("/login")} class={buttonVariants({ variant: "outline" })} aria-label="Log in">
    <LogInIcon />
    <span class="hidden sm:inline">Log in</span>
  </a>
{/snippet}

{#snippet accountButton(user: Awaited<ReturnType<typeof getHeaderUser>>)}
  {#if user}
    <a href={resolve("/(protected)/dashboard")} class={buttonVariants({ variant: "outline" })} aria-label="Dashboard">
      <AvatarUI.Root class="size-5 shrink-0">
        {#if user.image}
          <AvatarUI.Image src={user.image} alt="" />
        {/if}
        <AvatarUI.Fallback class="text-[0.5rem]"
          >{user.name.trim().slice(0, 2).toUpperCase() || "SC"}</AvatarUI.Fallback>
      </AvatarUI.Root>
      <span class="hidden sm:inline">Dashboard</span>
    </a>
  {:else}
    {@render loginButton()}
  {/if}
{/snippet}

<div class="invisible h-12 w-full"></div>
<div
  class="pointer-events-auto fixed top-0 left-0 z-30 h-25.25 w-full glass transition-[clip-path] duration-150 ease-out glass-bg-popover"
  style="clip-path: {clipPath}">
</div>
<header
  class="@container fixed top-0 left-0 isolate z-35 h-12 w-full border-b px-2.5 pt-[env(safe-area-inset-top,0)] pr-[max(0.625rem,env(safe-area-inset-right))] pl-[max(0.625rem,env(safe-area-inset-left))] leading-12">
  <div class="flex h-full w-full items-center-safe justify-between">
    <div class="flex gap-2">
      <Button.Root
        href="/"
        class="flex items-center-safe justify-center-safe gap-2 font-bold"
        data-sveltekit-preload-data="hover">
        <Avatar.Root class="size-6 shrink-0 rounded-xl select-none">
          {#if themeIconQuery.current}
            <Avatar.Image
              loading="lazy"
              src="data:image/svg+xml;base64,{btoa(themeIconQuery.current)}"
              alt="SkyCrypt"
              class="pointer-events-none h-6 select-none" />
          {:else}
            <Avatar.Image
              loading="lazy"
              src="/img/app-icons/svg.svg"
              alt="SkyCrypt"
              class="pointer-events-none h-6 select-none" />
          {/if}

          <Avatar.Fallback
            class="flex h-full items-center justify-center text-lg font-semibold text-muted-foreground uppercase"
            >SC</Avatar.Fallback>
        </Avatar.Root>
      </Button.Root>
      <div class="flex flex-col items-start justify-center-safe gap-1">
        <Button.Root href="/" class="leading-none font-bold text-nowrap" data-sveltekit-preload-data="hover">
          SkyCrypt
          {#if isBeta || dev}
            Beta
          {/if}
        </Button.Root>

        {#if packageVersion}
          <Button.Root
            class="text-xs leading-none font-normal text-muted-foreground transition-colors hover:text-primary/60 data-[beta=true]:text-accent-4/60 data-[beta=true]:hover:text-accent-4"
            rel="noreferrer"
            href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/releases/tag/v{packageVersion}"
            target="_blank"
            data-beta={isBeta || dev}>v{packageVersion}</Button.Root>
        {/if}
      </div>
    </div>

    <Menu />

    <div class="flex gap-1">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}>
          {#if userPrefersMode.current === "system"}
            <SunMoonIcon />
          {:else if userPrefersMode.current === "dark"}
            <MoonIcon />
          {:else if userPrefersMode.current === "light"}
            <SunIcon />
          {/if}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          class="before:backdrop-blur-none performance:bg-popover standard:before:backdrop-blur-2xl">
          <DropdownMenu.Item onclick={() => setMode("dark")}>Dark</DropdownMenu.Item>
          <DropdownMenu.Item onclick={() => setMode("light")}>Light</DropdownMenu.Item>
          <DropdownMenu.Item onclick={() => resetMode()}>System</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <svelte:boundary>
        {@render accountButton(await getHeaderUser())}
        {#snippet failed()}
          {@render loginButton()}
        {/snippet}
      </svelte:boundary>
      <Settings />
    </div>
  </div>
</header>
