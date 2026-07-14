<script lang="ts">
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import { getCardDataContext } from "../index";

  const { profile } = getCardDataContext();

  const apiSettings = $derived(Object.entries(profile?.apiSettings ?? {}).filter(([_, value]) => !value));
</script>

<div class="flex flex-wrap items-center gap-x-2 text-3xl text-foreground">
  Stats for
  <div
    class="inline-flex items-center gap-2 rounded-full bg-foreground/10 px-1.5 py-1.5 pr-3 align-middle text-2xl font-semibold whitespace-nowrap">
    {#if profile != null && profile.rank?.rankColor}
      <div
        class="relative flex items-center justify-center overflow-hidden rounded-full px-2 py-1"
        style="background-color: {profile.rank.rankColor}">
        <div
          class="absolute top-0 -right-3 h-14 w-1/2 skew-x-[-20deg]"
          style="background-color: {profile.rank.plusColor ?? profile.rank.rankColor}">
        </div>
        <div class="relative z-20 inline-flex justify-between gap-3 text-base font-bold text-white">
          <span>{profile.rank.rankText}</span>
          {#if profile.rank.plusText}
            <span>{profile.rank.plusText}</span>
          {/if}
        </div>
      </div>
    {/if}
    <span>{profile?.displayName}</span>
  </div>
  on
  <div
    class="relative inline-flex items-center gap-2 rounded-full bg-foreground/10 align-middle text-2xl font-semibold data-[warning=false]:px-3 data-[warning=false]:py-1.5 data-[warning=true]:border-2 data-[warning=true]:border-yellow-500/20 data-[warning=true]:px-2.5 data-[warning=true]:py-1"
    data-warning={apiSettings?.length > 0}>
    <div class="rounded-full">
      <span>{profile?.profile_cute_name}</span>
      <span>{@render profileIcon(profile?.game_mode ?? "")}</span>
    </div>

    {#if apiSettings?.length}
      <div class="rounded-full bg-yellow-500/20 px-2 py-1">
        <TriangleAlert class="size-6 text-yellow-500" />
      </div>
    {/if}
  </div>
</div>

{#snippet profileIcon(gameMode: string)}
  {#if gameMode === "bingo"}
    🎲
  {/if}
  {#if gameMode === "ironman"}
    ♻️
  {/if}
  {#if gameMode === "island"}
    🌴
  {/if}
{/snippet}
