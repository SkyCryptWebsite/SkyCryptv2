<script lang="ts">
  import { getFavorites, getRecentSearches } from "$ctx";
  import * as Command from "$ui/command";
  import { Avatar } from "bits-ui";

  const { ign = "" }: { ign?: string } = $props();
  const favorites = getFavorites();
  const recentSearches = getRecentSearches();

  const hasFavorites = $derived(
    favorites.current.length !== 0 && (!ign || !favorites.current.some((f) => f.ign === ign))
  );
  const hasRecentSearches = $derived(recentSearches.current.length !== 0);
</script>

{#snippet playerItem(item: { ign: string; uuid?: string })}
  <Command.LinkItem
    value={item.ign}
    href="/stats/{item.ign}"
    keywords={[item.ign, item.uuid, "profile", "player", "favorite", "favorites"].filter(Boolean) as string[]}>
    <Avatar.Root class="size-4 shrink-0 bg-foreground/10">
      <Avatar.Image
        loading="lazy"
        src={item.uuid
          ? `https://nmsr.nickac.dev/face/${item.uuid}`
          : "https://nmsr.nickac.dev/face/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40"}
        alt={item.ign}
        class="aspect-square size-4 [image-rendering:pixelated]" />
      <Avatar.Fallback
        class="flex h-full items-center justify-center text-lg font-semibold text-muted-foreground uppercase">
        {item.ign.slice(0, 2)}
      </Avatar.Fallback>
    </Avatar.Root>
    {item.ign}
  </Command.LinkItem>
{/snippet}

{#if hasRecentSearches}
  <Command.Group heading="Recent Searches">
    {#each recentSearches.current.slice(0, 5) as recentSearch, index (index)}
      {#if !ign || recentSearch.ign !== ign}
        {@render playerItem(recentSearch)}
      {/if}
    {/each}
  </Command.Group>
{/if}

{#if hasFavorites}
  <Command.Group heading="Favorites">
    {#each favorites.current.slice(0, 5) as favorite, index (index)}
      {#if !ign || favorite.ign !== ign}
        {@render playerItem(favorite)}
      {/if}
    {/each}
  </Command.Group>
{/if}
