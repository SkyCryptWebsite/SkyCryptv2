<script module lang="ts">
  export enum Role {
    MAINTAINER = "MAINTAINER",
    FACILITATOR = "FACILITATOR",
    CONTRIBUTOR = "CONTRIBUTOR",
    FAVORITE = "FAVORITE"
  }
</script>

<script lang="ts">
  import { cn, flyAndScale } from "$lib/shared/utils";
  import { favorites } from "$lib/stores/favorites";
  import { Avatar, Button, Tooltip } from "bits-ui";
  import CodeXml from "lucide-svelte/icons/code-xml";
  import GitPullRequestArrow from "lucide-svelte/icons/git-pull-request-arrow";
  import Server from "lucide-svelte/icons/server";
  import Star from "lucide-svelte/icons/star";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const iconMapper: Record<Role, typeof CodeXml | typeof Server | typeof GitPullRequestArrow | typeof Star> = {
    [Role.MAINTAINER]: CodeXml,
    [Role.FACILITATOR]: Server,
    [Role.CONTRIBUTOR]: GitPullRequestArrow,
    [Role.FAVORITE]: Star
  };

  const getUsername = async (uuid: string) => {
    const res = await fetch(`/api/uuid/${uuid}`);
    const { username } = await res.json();
    return username;
  };
</script>

{#snippet profile(user: { id: string; name: string; quote?: string; role?: Role }, options?: { tip?: boolean; favorite?: boolean })}
  <div class={cn("relative rounded-lg transition-all duration-300 hover:scale-105", { "transition-all duration-300 hover:scale-105": !options?.tip })}>
    <Button.Root href={options?.tip ? "#" : `/stats/${user.id}`} class="relative flex min-w-0 items-center gap-4 rounded-lg p-5 backdrop-blur-lg backdrop-brightness-50">
      <Avatar.Root class="size-16 shrink-0 rounded-lg bg-text/10">
        <Avatar.Image src={options?.tip ? "https://mc-heads.net/avatar/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40/64" : `https://crafatar.com/avatars/${user.id}?size=64&overlay`} alt={user.name} class="aspect-square size-16 rounded-lg " />
        <Avatar.Fallback class="flex h-full items-center justify-center text-lg font-semibold uppercase text-text/60">
          {user.name.slice(0, 2)}
        </Avatar.Fallback>
      </Avatar.Root>
      <div class="flex flex-col justify-center gap-0">
        <div class="text-lg font-semibold text-text">
          {user.name}
        </div>
        {#if user.quote}
          <div class="text-pretty pr-4 text-sm font-medium text-text/80">{@html user.quote}</div>
        {/if}
      </div>
    </Button.Root>
    {#if user.role}
      {@const Icon = iconMapper[user.role]}
      <Tooltip.Root group="role" openDelay={0} closeDelay={0}>
        <Tooltip.Trigger let:builder asChild>
          <div
            use:builder.action
            {...builder}
            class="absolute bottom-3 right-3"
            role="button"
            tabindex="0"
            onclick={(e) => {
              if (!options?.favorite) return;
              e.stopPropagation();
              e.stopImmediatePropagation();
              favorites.set($favorites.filter((uuid) => uuid !== user.id));
            }}>
            <Icon class={cn("size-5", options?.favorite ? "fill-[#B0AEAE] stroke-[#B0AEAE]" : "text-text/60")} />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content class="rounded-lg bg-background-grey p-4" transition={flyAndScale} transitionConfig={{ y: 8, duration: 150 }} sideOffset={6} side="top" align="center">
          <Tooltip.Arrow />
          <p class="font-semibold capitalize text-text/80">
            {#if options?.favorite}
              Favorited
            {:else}
              SkyCrypt {Role[user.role].toLowerCase()}
            {/if}
          </p>
        </Tooltip.Content>
      </Tooltip.Root>
    {/if}
  </div>
{/snippet}

{#snippet profileSkeleton()}
  <div class="relative flex min-w-0 items-center gap-2 rounded-lg p-5 backdrop-blur-lg backdrop-brightness-50">
    <div class="size-16 animate-pulse rounded-lg bg-text/10"></div>
    <div class="flex flex-col gap-1">
      <div class="h-6 w-24 animate-pulse rounded-lg bg-text/10"></div>
      <div class="h-3 w-44 animate-pulse rounded-lg bg-text/10"></div>
    </div>
    <div class="absolute bottom-3 right-3 size-5 animate-pulse rounded-lg bg-text/10"></div>
  </div>
{/snippet}

<main class="mx-auto flex min-h-screen max-w-[68rem] flex-col justify-center gap-6 pb-[max(1.25rem+env(safe-area-inset-bottom))] pl-[max(1.25rem+env(safe-area-inset-left))] pr-[max(1.25rem+env(safe-area-inset-right))] pt-5">
  <form class="flex w-full flex-col justify-center gap-6 rounded-lg py-6 text-3xl backdrop-blur-lg backdrop-brightness-50">
    <h2 class="m-1 w-full text-center font-semibold">Show SkyBlock stats for</h2>
    <input type="search" name="ign" enterkeyhint="go" required placeholder="Enter username" class="relative h-16 flex-grow bg-text/10 text-center font-normal text-text focus-visible:outline-none" />
    <Button.Root type="submit" class="mx-auto flex w-full max-w-fit items-center justify-center rounded-3xl bg-icon px-6 py-3 text-base font-bold uppercase transition-all duration-150 [text-shadow:0_0_3px_rgba(0,0,0,.5)] hover:scale-[1.015]">Show me</Button.Root>
  </form>
  <Button.Root href="https://www.patreon.com/shiiyu" target="_blank" rel="noreferrer" class="flex items-center gap-4 rounded-lg p-4 backdrop-blur-lg backdrop-brightness-50 transition-all duration-300 hover:scale-[1.05]">
    <Avatar.Root class="">
      <Avatar.Image src="/img/icons/patreon.svg" alt="Patreon logo" class="size-12" />
      <Avatar.Fallback class="rounded-lg bg-text/10">PA</Avatar.Fallback>
    </Avatar.Root>
    <div>
      <div class="font-semibold">
        <span class="text-text/70">SkyCrypt's</span>
        <span class="text-link">Patreon</span>
      </div>
      <div class="font-medium text-text/90 opacity-85">Help keep SkyCrypt ad free by donating</div>
    </div>
  </Button.Root>
  <div class="grid grid-cols-3 gap-5">
    {#if $favorites.length === 0}
      {@render profile({ id: "0", name: "No favorites set!", quote: "Why don't you set a favorite?" }, { tip: true })}
    {:else}
      {#each $favorites.reverse() as favorite}
        {#await getUsername(favorite)}
          {@render profileSkeleton()}
        {:then username}
          {@render profile({ id: favorite, name: username, role: Role.FAVORITE }, { favorite: true })}
        {/await}
      {/each}
    {/if}

    {#await data.contributors}
      {#each Array(3 * 4)}
        {@render profileSkeleton()}
      {/each}
    {:then contributors}
      {#each contributors as contributor (contributor.id)}
        {@render profile(contributor)}
      {/each}
    {/await}
  </div>
</main>
