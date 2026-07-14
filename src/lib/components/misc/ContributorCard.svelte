<script lang="ts">
  import { resolve } from "$app/paths";
  import { getFavorites, getInternalState } from "$ctx";
  import { cn } from "$lib/shared/utils";
  import type { Contributor } from "$routes/contributors.remote";
  import { Role } from "$routes/enums";
  import * as Item from "$ui/item";
  import * as Tooltip from "$ui/tooltip";
  import type { Component } from "svelte";

  interface Props {
    user: Contributor;
    options?: {
      tip?: boolean;
      favorite?: boolean;
    };
    iconMapper: Record<Role, Component | string>;
  }

  let { user, options, iconMapper }: Props = $props();

  const favorites = getFavorites();
  const internalState = getInternalState();
</script>

{#snippet tooltipContent()}
  <p class="font-semibold text-muted-foreground capitalize">
    {#if options?.favorite}
      Favorited
    {:else if user.role}
      SkyCrypt {Role[user.role].toLowerCase()}
    {:else}
      Unknown
    {/if}
  </p>
{/snippet}

<Item.Root
  variant="outline"
  class={cn("glass glass-brightness-150 glass-contrast-60 dark:glass-brightness-50 dark:glass-contrast-100", {
    "delay-75 duration-300 ease-out hover:scale-105 [a]:transition-[scale] standard:[a]:hover:bg-inherit": !options?.tip
  })}>
  {#snippet child({ props })}
    <svelte:element
      this={options?.tip ? "div" : "a"}
      {...props}
      href={options?.tip ? undefined : resolve("/stats/[ign]", { ign: user.id })}>
      <Item.Media variant="image" class="size-16 translate-y-0! self-center-safe! rounded-none">
        <img
          loading="lazy"
          src={options?.tip
            ? "https://nmsr.nickac.dev/face/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40"
            : `https://nmsr.nickac.dev/face/${user.id}`}
          alt={user.username} />
      </Item.Media>
      <Item.Content>
        <Item.Title>{user.displayName ?? user.username}</Item.Title>
        {#if user.quote}
          <Item.Description class={cn(user.role === Role.TECHNOBLADE ? "italic" : "")}
            >{@html user.quote}</Item.Description>
        {/if}
      </Item.Content>
      {#if user.role}
        {const Icon = iconMapper[user.role]}
        <Tooltip.Root>
          <Tooltip.Trigger
            disabled={options?.tip || Icon === "string"}
            class="absolute right-2 bottom-2"
            onclick={() => {
              if (!options?.favorite) {
                internalState.content = tooltipContent;
              } else {
                favorites.current = favorites.current.filter((favorite) => favorite.uuid !== user.id);
              }
            }}>
            {#snippet child({ props })}
              <div {...props} tabindex="0" role="button">
                {#if typeof Icon === "string"}
                  <img src={Icon} alt="Technoblade Icon" class="size-4" />
                {:else}
                  <Icon
                    class={cn(
                      "size-4",
                      options?.favorite
                        ? "fill-[oklch(75.25%_0.0023_17.21)] stroke-[oklch(75.25%_0.0023_17.21)]"
                        : "text-muted-foreground"
                    )} />
                {/if}
              </div>
            {/snippet}
          </Tooltip.Trigger>

          <Tooltip.Content
            class="z-50 rounded-xl border glass bg-transparent p-4 text-sm glass-bg-popover performance:bg-popover"
            sideOffset={8}
            side="top"
            align="center"
            arrowClasses="hidden">
            {@render tooltipContent()}
          </Tooltip.Content>
        </Tooltip.Root>
      {/if}
    </svelte:element>
  {/snippet}
</Item.Root>

<!-- <div class={cn("relative rounded-xl", { "transition-all duration-300 ease-out hover:scale-105": !options?.tip })}>
  <Button href={options?.tip ? undefined : resolve("/stats/[ign]", { ign: user.id })} class="relative flex h-full w-full min-w-0 items-center gap-4 rounded-xl p-5 text-left glass glass-brightness-150 dark:glass-brightness-50 glass-contrast-60 dark:glass-contrast-100">
    <Avatar.Root class="size-16 shrink-0">
      <Avatar.Image loading="lazy" src={options?.tip ? "https://nmsr.nickac.dev/face/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40" : `https://nmsr.nickac.dev/face/${user.id}`} alt={user.username} class={cn("aspect-square size-16 [image-rendering:pixelated]", options?.tip ? "rounded-xl bg-foreground/10" : "")} />
      <Avatar.Fallback class="flex h-full items-center justify-center rounded-xl bg-foreground/10 text-lg font-semibold text-muted-foreground uppercase">
        {user.username?.slice(0, 2)}
      </Avatar.Fallback>
    </Avatar.Root>
    <div class="flex flex-col justify-center gap-0">
      <div class="text-lg font-semibold text-foreground">
        {user.displayName ?? user.username}
      </div>
      {#if user.quote}
        <div class={cn("pr-4 text-sm font-medium text-pretty text-foreground/80", user.role === Role.TECHNOBLADE ? "italic" : "")}>{@html user.quote}</div>
      {/if}
    </div>
  </Button>

</div> -->
