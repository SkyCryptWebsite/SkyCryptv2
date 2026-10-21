<script lang="ts">
  import { PUBLIC_DISCORD_INVITE, PUBLIC_PATREON } from "$app/env/public";
  import { resolve } from "$app/paths";
  import { getInternalState, getPreferences } from "$ctx";
  import { buttonVariants } from "$src/lib/components/ui/button";
  import { IsHover } from "$src/lib/hooks/is-hover.svelte";
  import { cn } from "$src/lib/shared/utils";
  import { Button } from "$ui/button";
  import * as Kbd from "$ui/kbd";
  import * as Popover from "$ui/popover";
  import type { LucideIcon } from "@lucide/svelte";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import InfoIcon from "@lucide/svelte/icons/info";
  import SearchIcon from "@lucide/svelte/icons/search";
  import { SvglDiscordLogo, SvglPatreonLogo, type SvglLogo } from "@selemondev/svgl-svelte";

  type ListItemProps = {
    title: string;
    href: string;
    content: string;
    class?: string;
    icon: LucideIcon | typeof SvglLogo;
  };

  const preferences = getPreferences();
  const internalState = getInternalState();
  const isHover = new IsHover();

  let popoverOpen = $state(false);
</script>

{#snippet ListItem({ title, content, href, class: className, icon: IconComponent }: ListItemProps)}
  <!-- eslint-disable svelte/no-navigation-without-resolve -->
  <a
    {href}
    class={cn(
      "flex items-center gap-1.5 rounded-3xl p-3 text-sm transition-all interact:scale-95 interact:bg-background/50 [&_svg:not([class*='size-'])]:size-4 ",
      className
    )}
    onclick={() => (popoverOpen = false)}>
    <div class="flex flex-col gap-1">
      <div class="flex items-center-safe gap-1">
        <IconComponent class="size-5" />
        <div class="text-left text-sm leading-none font-medium">{title}</div>
      </div>
      <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
        {content}
      </p>
    </div>
  </a>
{/snippet}

<div class="flex gap-4">
  <Popover.Root bind:open={popoverOpen}>
    <Popover.Trigger
      class={buttonVariants({ variant: "outline", class: "group hidden md:flex data-open:focus:bg-transparent" })}
      openOnHover={true}
      openDelay={150}
      closeDelay={150}>
      Home
      <ChevronDownIcon class="size-3 transition-all duration-300 group-data-[state=open]:rotate-180" />
    </Popover.Trigger>
    <Popover.Content
      class="grid gap-1 glass sm:min-w-lg! sm:grid-cols-[16rem_auto] standard:bg-transparent!"
      align="center"
      side="bottom"
      sideOffset={12}
      arrowPadding={12}
      collisionPadding={12}>
      <a
        href={resolve("/newsroom")}
        class="row-span-3 flex h-full flex-col items-stretch gap-3 rounded-3xl p-3 text-sm transition-all interact:scale-95 interact:bg-background/50"
        onclick={() => (popoverOpen = false)}>
        <img
          src="/img/newsroom.avif"
          alt="Newsroom"
          class="pointer-events-none min-h-0 w-full flex-1 rounded-2xl object-cover select-none" />
        <p class="text-sm leading-snug text-muted-foreground">
          Latest announcements and updates from the SkyCrypt team.
        </p>
      </a>
      {@render ListItem({
        href: PUBLIC_DISCORD_INVITE,
        title: "Discord",
        content: "Announcements, Community, Bug Reports, Feature Requests, Support",
        icon: SvglDiscordLogo
      })}

      {@render ListItem({
        href: PUBLIC_PATREON,
        title: "Patreon",
        content: "Help keep SkyCrypt ad free by donating",
        icon: SvglPatreonLogo
      })}

      {@render ListItem({
        href: resolve("/(pages)/about"),
        title: "About",
        content: "Learn more about SkyCrypt and the team behind it",
        icon: InfoIcon,
        class: "[&_svg]:text-primary"
      })}
    </Popover.Content>
  </Popover.Root>

  <Button
    class={buttonVariants({ variant: "outline", class: "relative data-open:focus:bg-transparent" })}
    onpointerdown={() => (internalState.openCommand = true)}>
    <div class="flex items-center-safe gap-1">
      <span class="hidden md:block">Search</span>
      {#if isHover.current}
        <Kbd.Root class="right-4 ml-2 hidden size-fit min-w-auto border bg-inherit py-0.5 md:block"
          >{preferences.keybind}</Kbd.Root>
      {/if}
      <SearchIcon class={cn("size-4 md:size-3", isHover.current && "md:hidden")} />
    </div>
  </Button>
</div>
