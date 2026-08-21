<script lang="ts">
  import { resolve } from "$app/paths";
  import { getFavorites, getHoverContext, getProfileContext } from "$ctx";
  import { APINotice } from "$lib/components/notices";
  import { cn } from "$lib/shared/utils";
  import CardBuilder from "$src/lib/components/stats/CardBuilder.svelte";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Item from "$ui/item";
  import * as Popover from "$ui/popover";
  import Ban from "@lucide/svelte/icons/ban";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Heart from "@lucide/svelte/icons/heart";
  import HeartMinus from "@lucide/svelte/icons/heart-minus";
  import HeartPlus from "@lucide/svelte/icons/heart-plus";
  import Link from "@lucide/svelte/icons/link";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import { toast } from "svelte-sonner";

  let toastId: string | number = $state(0);
  let showMore = $state(false);
  let noticeOpen = $state(false);
  let ignOpen = $state(false);
  let profileOpen = $state(false);

  let noticeRef = $state<HTMLElement>(null!);
  let ignRef = $state<HTMLElement>(null!);

  const profile = $derived(getProfileContext().current);
  const isHover = getHoverContext();
  const favorites = getFavorites();

  const apiSettings = $derived(Object.entries(profile?.apiSettings ?? {}).filter(([_, value]) => !value));

  const iconMapper: Record<string, string> = {
    TWITTER: "x-twitter.svg",
    YOUTUBE: "youtube.svg",
    INSTAGRAM: "instagram.svg",
    TIKTOK: "tiktok.svg",
    TWITCH: "twitch.svg",
    DISCORD: "discord.svg",
    HYPIXEL: "hypixel.avif"
  };

  const emojiMapper: Record<string, string> = {
    bingo: "🎲",
    ironman: "♻️",
    island: "🌴"
  };

  function copyToClipboard(value: string) {
    navigator.clipboard.writeText(value);
    toast.dismiss(toastId);
    toastId = toast.success(`Copied ${value} to your clipboard!`);
  }
</script>

<div
  class="flex flex-wrap items-center gap-x-2 gap-y-3 text-4xl *:motion-preset-focus *:motion-preset-slide-right *:motion-delay-[calc(sibling-index()*0.1s)]">
  <span>Stats for</span>
  <Popover.Root bind:open={ignOpen}>
    <Popover.Trigger
      disabled={(profile?.members?.length || 1) <= 1}
      class="inline-flex items-center rounded-full bg-foreground/10 py-2 pr-4 pl-2 align-middle text-xl font-semibold whitespace-nowrap transition-[scale,background-color] duration-300 ease-out data-[state=open]:scale-95 data-[state=open]:bg-foreground/20 sm:text-3xl not-disabled:interact:scale-95 not-disabled:interact:bg-foreground/20"
      bind:ref={ignRef}>
      {#if profile != null && profile.rank?.rankColor}
        <div
          class="relative flex items-center justify-center overflow-hidden rounded-full bg-(--color) px-2 py-1 text-xl"
          style={`--color:${profile.rank.rankColor}`}>
          <div class="relative z-20 inline-flex justify-between gap-3 text-sm font-bold text-white sm:text-lg">
            <span>{profile.rank.rankText}</span>
            {#if profile.rank.plusText}
              <span>{profile.rank.plusText}</span>
            {/if}
          </div>
          <div
            class="absolute top-0 -right-3 bottom-0 z-10 h-14 w-1/2 skew-x-[-20deg] bg-(--plusColor)"
            style={`--plusColor:${profile.rank.plusColor ?? profile.rank.rankColor}`}>
          </div>
        </div>
      {/if}
      <span class={cn(profile?.rank?.rankColor ? "pl-4" : "pl-2")}>{profile?.displayName}</span>
    </Popover.Trigger>

    <Popover.Content
      class="w-full min-w-64 overflow-hidden glass bg-inherit p-2 ring-0 glass-bg-popover"
      sideOffset={8}
      side="bottom"
      align="start"
      collisionPadding={6}
      customAnchor={ignRef}
      strategy="absolute"
      style="--transform-origin: top">
      {#each profile?.members?.toSorted() as member (member.uuid)}
        {#if member.username !== profile?.username}
          <Item.Root
            variant="outline"
            size="sm"
            data-removed={member.removed}
            class="group flex-nowrap bg-foreground/5 [a]:transition-[scale,background-color] [a]:duration-300 [a]:ease-out [a]:hover:bg-foreground/10 [a]:interact:scale-95">
            {#snippet child({ props })}
              <a
                href={resolve("/stats/[ign]/[[profile]]", {
                  ign: member.username ?? "",
                  profile: member?.profile_id
                })}
                data-sveltekit-preload-data="hover"
                {...props}>
                <Item.Media>
                  <Avatar.Root class="size-8 shrink-0 after:border-none">
                    <Avatar.Image
                      loading="lazy"
                      src="https://nmsr.nickac.dev/face/{member.uuid}"
                      alt={member.username}
                      class="aspect-square size-8 rounded-none [image-rendering:pixelated] group-data-[removed=true]:grayscale-100" />
                    <Avatar.Fallback>
                      <img
                        loading="lazy"
                        src="https://nmsr.nickac.dev/face/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40"
                        alt="Steve"
                        class="aspect-square size-8 rounded-none [image-rendering:pixelated] group-data-[removed=true]:grayscale-100" />
                    </Avatar.Fallback>
                  </Avatar.Root>
                </Item.Media>
                <Item.Content>
                  <Item.Title class="text-3xl font-semibold light:invert">{member.username}</Item.Title>
                </Item.Content>
                {#if member.removed}
                  <Item.Media>
                    <Ban class="size-4 shrink-0 text-foreground light:invert" />
                  </Item.Media>
                {/if}
              </a>
            {/snippet}
          </Item.Root>
        {/if}
      {/each}
    </Popover.Content>
  </Popover.Root>
  <span>on</span>
  <div
    class="relative inline-flex items-center gap-2 rounded-full bg-foreground/10 px-2 py-1 align-middle text-xl font-semibold transition-[scale,background-color] duration-300 ease-out data-[disabled=false]:data-[open=true]:scale-95 data-[disabled=false]:data-[open=true]:bg-foreground/20 data-[warning=true]:border-2 data-[warning=true]:border-yellow-500/20 sm:text-3xl data-[disabled=false]:interact:scale-95 data-[disabled=false]:interact:bg-foreground/20"
    data-open={profileOpen || noticeOpen}
    data-warning={apiSettings.length > 0}
    bind:this={noticeRef}
    data-disabled={(profile?.profiles?.length || 1) <= 1}>
    <Popover.Root bind:open={profileOpen}>
      <Popover.Trigger
        disabled={(profile?.profiles?.length || 1) <= 1}
        onpointerenter={() => {
          if (profile == null) return;
          if (profile.profiles?.length) return;
          if (!isHover.current) return;
          ignOpen = false;
          profileOpen = true;
        }}
        class="rounded-full px-2 py-1">
        {profile?.profile_cute_name}
        {#if profile?.game_mode}
          {emojiMapper[profile.game_mode]}
        {/if}
      </Popover.Trigger>

      <Popover.Content
        class="w-full min-w-64 overflow-hidden glass bg-inherit font-semibold ring-0 glass-bg-popover"
        sideOffset={8}
        side="bottom"
        align="start"
        collisionPadding={6}
        customAnchor={noticeRef}
        strategy="absolute"
        style="--transform-origin: top">
        {#each profile?.profiles ?? [] as otherProfile (otherProfile.profile_id)}
          {#if otherProfile.profile_id !== profile?.profile_id}
            <Item.Root
              variant="outline"
              size="sm"
              class="flex-nowrap bg-foreground/5 [a]:transition-[scale,background-color] [a]:duration-300 [a]:ease-out [a]:hover:bg-foreground/10 [a]:interact:scale-95">
              {#snippet child({ props })}
                <a
                  href={resolve("/stats/[ign]/[[profile]]", {
                    ign: profile?.username ?? "",
                    profile: otherProfile.cute_name
                  })}
                  data-sveltekit-preload-data="hover"
                  {...props}>
                  <Item.Content>
                    <Item.Title class="text-3xl font-semibold light:invert">
                      {otherProfile.cute_name}
                    </Item.Title>
                  </Item.Content>

                  {#if otherProfile.game_mode}
                    <Item.Media class="size-4 shrink-0 pr-4 text-3xl">
                      {emojiMapper[otherProfile.game_mode]}
                    </Item.Media>
                  {/if}
                </a>
              {/snippet}
            </Item.Root>
          {/if}
        {/each}
      </Popover.Content>
    </Popover.Root>

    {#if apiSettings.length}
      <Popover.Root bind:open={noticeOpen}>
        <Popover.Trigger class="rounded-full bg-yellow-500/20 px-4 py-2" onpointerenter={() => (noticeOpen = true)}>
          <TriangleAlert class="size-6 motion-preset-pulse text-yellow-500 motion-duration-1000" />
        </Popover.Trigger>

        <Popover.Content
          class="w-full max-w-sm overflow-hidden glass bg-inherit p-0 ring-0 glass-bg-popover"
          sideOffset={8}
          side="bottom"
          align="start"
          customAnchor={noticeRef}
          collisionPadding={6}
          strategy="absolute"
          style="--transform-origin: top">
          <APINotice />
        </Popover.Content>
      </Popover.Root>
    {/if}
  </div>
</div>
<div
  class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 *:motion-preset-focus *:motion-preset-slide-right *:motion-delay-[calc(sibling-index()*0.1s)]">
  <Button
    class="text-base font-semibold"
    onclick={() => {
      if (profile == null) return;
      if (!favorites.current.some((fav) => fav.uuid === profile.uuid)) {
        favorites.current = [
          ...favorites.current,
          { uuid: profile.uuid ?? "", ign: profile.username ?? "", displayName: profile.displayName ?? undefined }
        ];
        toast.dismiss(toastId);
        toastId = toast.success(`Added ${profile.username} to your favorites!`, {
          position: "top-center",
          icon: HeartPlus
        });
      } else {
        favorites.current = favorites.current.filter((fav) => fav.uuid !== profile.uuid);
        toast.dismiss(toastId);
        toastId = toast.success(`Removed ${profile.username} from your favorites!`, {
          position: "top-center",
          icon: HeartMinus
        });
      }
    }}>
    {#if favorites.current.some((fav) => fav.uuid === profile?.uuid)}
      <Heart class="size-4 fill-red-500 stroke-red-300" />
    {:else}
      <Heart class="size-4" />
    {/if}
  </Button>

  <Button
    onclick={() => {
      copyToClipboard(window.location.href);
    }}>
    <Link class="size-4" />
  </Button>

  <CardBuilder />

  <Button
    href={`https://plancke.io/hypixel/player/stats/${profile?.username}?utm_source=SkyCrypt&utm_campaign=Nav`}
    target="_blank"
    class="text-base font-semibold">
    Plancke <ExternalLink class="size-4" />
  </Button>

  <Button
    href={`https://eliteskyblock.com/@${profile?.username}/${profile?.profile_cute_name}?utm_source=SkyCrypt&utm_campaign=Nav`}
    target="_blank"
    class="text-base font-semibold">
    Elite <ExternalLink class="size-4" />
  </Button>

  <Button
    class="motion-preset-focus motion-preset-slide-right transition-opacity duration-150 ease-out motion-delay-[0.4s]"
    onclick={() => (showMore = !showMore)}>
    <ChevronRight class="size-4 transition-[rotate] duration-300 data-[show=true]:-rotate-180" data-show={showMore} />
  </Button>

  {#if showMore}
    <Button
      class="text-base font-semibold"
      style="animation-delay: 0s"
      onclick={() => {
        copyToClipboard(profile?.uuid ?? "");
      }}>
      Copy UUID
    </Button>

    <Button
      class="text-base font-semibold"
      style="animation-delay: 0.1s"
      onclick={() => {
        copyToClipboard(profile?.profile_id ?? "");
      }}>
      Copy Profile UUID
    </Button>

    {#if profile?.social}
      {#each Object.entries(profile.social) as [key, value], index (index)}
        <Button
          href={key === "DISCORD" ? undefined : value + "?utm_source=SkyCrypt&utm_campaign=Nav"}
          target="_blank"
          style={`animation-delay: ${(index + 2) * 0.1}s`}
          onclick={key === "DISCORD" ? () => copyToClipboard(value) : undefined}
          class="text-base font-semibold">
          <Avatar.Root class="size-4 rounded-none after:border-none">
            <Avatar.Image
              loading="lazy"
              src="/img/icons/{iconMapper[key]}"
              alt="{profile.username}'s {key.toLocaleLowerCase()}"
              class="size-4 rounded-none text-white" />
            <Avatar.Fallback>
              {profile.username?.slice(0, 2)}
            </Avatar.Fallback>
          </Avatar.Root>
          {#if key === "DISCORD"}
            {value}
          {/if}
        </Button>
      {/each}
    {/if}
  {/if}
</div>
