<script lang="ts">
  import type { Banner as BannerData } from "$types";
  import { PersistedState } from "runed";
  import Banner from "./Banner.svelte";

  const { banners }: { banners: BannerData[] } = $props();

  // Remembered per browser. Old IDs are dropped once their banner is gone.
  const dismissed = new PersistedState<string[]>("skycryptDismissedBanners", []);

  let now = $state(Date.now());
  const time = (iso: string | null) => (iso ? Date.parse(iso) : null);
  const visible = $derived(
    banners.filter((banner) => {
      const start = time(banner.startsAt);
      const end = time(banner.endsAt);
      if (start !== null && start > now) return false;
      if (end !== null && end <= now) return false;
      return !(banner.dismissible && dismissed.current.includes(banner.id));
    })
  );

  // Wake up at the next start or end, so scheduled banners appear and disappear on time.
  $effect(() => {
    const next = banners
      .flatMap((banner) => [time(banner.startsAt), time(banner.endsAt)])
      .filter((at): at is number => at !== null && at > now)
      .sort((a, b) => a - b)[0];
    if (next === undefined) return;
    // setTimeout overflows past ~24.8 days; the banner list only reaches a day ahead anyway.
    const timeout = setTimeout(() => (now = Date.now()), Math.min(next - now, 2 ** 31 - 1));
    return () => clearTimeout(timeout);
  });

  function dismiss(id: string) {
    const ids = new Set(banners.map((banner) => banner.id));
    dismissed.current = [...dismissed.current.filter((dismissedId) => ids.has(dismissedId)), id];
  }
</script>

{#if visible.length}
  <!-- Positioned so the stats page's fixed skin and overlay panels (z-10) don't cover it; the header (z-35) stays on top. -->
  <div class="relative z-20">
    {#each visible as banner (banner.id)}
      <Banner
        html={banner.html}
        variant={banner.variant}
        onDismiss={banner.dismissible ? () => dismiss(banner.id) : undefined} />
    {/each}
  </div>
{/if}
