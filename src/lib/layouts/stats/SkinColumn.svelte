<script lang="ts">
  import { browser } from "$app/env";
  import { getPreferences } from "$ctx";
  import { Skeleton } from "$ui/skeleton";
  import Image from "@lucide/svelte/icons/image";
  import { Avatar } from "bits-ui";
  import { cubicOut } from "svelte/easing";
  import { MediaQuery } from "svelte/reactivity";
  import { fade } from "svelte/transition";
  import type { ModelsStatsOutput } from "#lib/shared/api/orval-generated";

  // Lives outside the profile boundary so the skin viewer keeps spinning from loading into the loaded profile
  const { profileView, ign }: { profileView: Promise<{ profile: ModelsStatsOutput }>; ign: string } = $props();

  const preferences = getPreferences();
  const isWide = new MediaQuery("(min-width: 1210px)");
  let skinFailed = $state(false);
  const showStaticSkin = $derived(preferences.performanceMode || skinFailed);
  const player = $derived(profileView.then(({ profile }) => profile));
</script>

<div class="@container fixed top-1/2 left-0 z-10 hidden h-dvh w-[30vw] -translate-y-1/2 @[75rem]/parent:block">
  {#if showStaticSkin}
    {#await profileView}
      <div class="flex size-full items-center justify-center">
        <Skeleton class="h-128 w-56" />
      </div>
    {:then { profile }}
      <Avatar.Root class="flex size-full items-center justify-center">
        {#snippet child({ props })}
          <div transition:fade={{ duration: 300, easing: cubicOut }} {...props}>
            <Avatar.Image
              loading="lazy"
              src="https://nmsr.nickac.dev/fullbody/{profile.uuid}?no=shadow"
              alt="{profile.username}'s avatar"
              class="max-h-128 object-cover" />
            <Avatar.Fallback>
              <Image class="size-24 object-cover text-foreground" />
            </Avatar.Fallback>
          </div>
        {/snippet}
      </Avatar.Root>
    {:catch}
      <!-- The page shows the error -->
    {/await}
  {:else if browser && isWide.current}
    {#await import("#lib/components/misc/Skin3D.svelte") then { default: Skin3D }}
      <Skin3D {player} {ign} showStaticSkin={() => (skinFailed = true)} class="h-full" />
    {/await}
  {/if}
</div>
