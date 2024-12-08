<script lang="ts">
  import { flyAndScale } from "$lib/shared/utils";
  import type { Stats as StatsType } from "$lib/types/stats";
  import { Avatar, Button, DropdownMenu } from "bits-ui";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import ExternalLink from "lucide-svelte/icons/external-link";
  import Share from "lucide-svelte/icons/share";
  import Star from "lucide-svelte/icons/star";
  import { getContext } from "svelte";

  const profile = getContext<StatsType>("profile");

  const iconMapper: Record<string, string> = {
    twitter: "x-twitter.svg",
    youtube: "youtube.svg",
    instagram: "instagram.svg",
    tiktok: "tiktok.svg",
    twitch: "twitch.svg",
    discord: "discord.svg",
    hypixel: "hypixel.png"
  };
</script>

<div class="mt-12 flex flex-wrap items-center gap-x-2 gap-y-3 text-4xl">
  Stats for
  <div class="inline-flex items-center gap-2 rounded-full bg-[#7f7f7f]/20 py-2 pl-2 pr-4 align-middle text-3xl font-semibold">
    <div class="nice-colors-dark light dark relative flex items-center justify-center overflow-hidden rounded-full bg-[var(--color)] px-2 py-1 text-xl" style={`--color:${profile.rank?.color}`}>
      <div class="relative z-20 inline-flex justify-between gap-3 text-lg font-bold">
        <span>{profile.rank?.tag}</span>
        {#if profile.rank?.plus}
          <span>{profile.rank?.plus}</span>
        {/if}
      </div>
      <div class="absolute -right-3 bottom-0 top-0 z-10 h-14 w-1/2 skew-x-[-20deg] bg-[var(--plusColor)]" style={`--plusColor:${profile.rank?.plusColor ?? profile.rank?.color}`}></div>
    </div>
    <span>{profile.username}</span>
  </div>
  on
  <DropdownMenu.Root>
    <DropdownMenu.Trigger class="inline-flex items-center rounded-full bg-[#7f7f7f]/20 px-4 py-2 align-middle text-3xl font-semibold">
      {profile.profile_cute_name}
    </DropdownMenu.Trigger>

    <DropdownMenu.Content class="z-[99999]  min-w-64 overflow-hidden rounded-lg bg-background-grey/95 text-3xl font-semibold" align="start" side="bottom" transition={flyAndScale} transitionConfig={{ y: -8, duration: 150 }}>
      {#each profile.profiles as otherProfile}
        <DropdownMenu.Item href={`/stats/${profile.username}/${otherProfile.cute_name}`} class="flex items-center p-4 hover:bg-text/20" data-sveltekit-preload-code="viewport">
          {otherProfile.cute_name}
          {#if otherProfile.game_mode === "bingo"}
            🎲
          {/if}
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
  <Button.Root class="rounded-full bg-icon/90 p-1 transition-opacity duration-150 hover:bg-icon">
    <Star class="size-5" />
  </Button.Root>

  <Button.Root
    class="rounded-full bg-icon/90 p-1 transition-opacity duration-150 hover:bg-icon"
    on:click={async () => {
      await navigator.share({
        url: location.href,
        title: `Stats for ${profile.username} on Hypixel`
      });
    }}>
    <Share class="size-5" />
  </Button.Root>

  <Button.Root href={`https://plancke.io/hypixel/player/stats/${profile.username}`} target="_blank" class="flex items-center justify-center gap-1.5 rounded-full bg-icon/90 px-2 py-1 font-semibold transition-opacity duration-150 hover:bg-icon">
    Plancke <ExternalLink class="size-4" />
  </Button.Root>

  <Button.Root href={`https://elitebot.dev/@${profile.username}/${profile.profile_cute_name}`} target="_blank" class="flex items-center justify-center gap-1.5 rounded-full bg-icon/90 px-2 py-1 font-semibold transition-opacity duration-150 hover:bg-icon">
    Elite <ExternalLink class="size-4" />
  </Button.Root>

  <Button.Root class="flex items-center justify-center gap-1.5 rounded-full bg-icon/90 px-2 py-1 font-semibold transition-opacity duration-150 hover:bg-icon" on:click={() => navigator.clipboard.writeText(profile.uuid)}>Copy UUID</Button.Root>
  {#each Object.entries(profile.social) as [key, value]}
    {key}
    {value}
  {/each}
  {#each Object.entries(profile.social) as [key, value]}
    {#if key === "discord"}
      <Button.Root class="flex items-center justify-center gap-1.5 rounded-full bg-icon/90 px-2 py-1 font-semibold transition-opacity duration-150 hover:bg-icon" on:click={() => navigator.clipboard.writeText(value)}>
        <Avatar.Root>
          <Avatar.Image src="/img/icons/{iconMapper[key.toLowerCase()]}" alt="{profile.username}'s Discord" class="size-4 text-white" />
          <Avatar.Fallback>
            {profile.username.slice(0, 2)}
          </Avatar.Fallback>
        </Avatar.Root>
        {key}
      </Button.Root>
    {:else}
      <Button.Root href={value} target="_blank" class="flex items-center justify-center gap-1.5 rounded-full bg-icon/90 px-2 py-1 font-semibold transition-opacity duration-150 hover:bg-icon">
        <Avatar.Root>
          <Avatar.Image src="/img/icons/{iconMapper[key.toLowerCase()]}" alt="{profile.username}'s Discord" class="size-4 text-white" />
          <Avatar.Fallback>
            {profile.username.slice(0, 2)}
          </Avatar.Fallback>
        </Avatar.Root>
      </Button.Root>
    {/if}
  {/each}

  <Button.Root class="rounded-full bg-icon/90 p-1 transition-opacity duration-150 hover:bg-icon">
    <ChevronRight class="size-5" />
  </Button.Root>
</div>
