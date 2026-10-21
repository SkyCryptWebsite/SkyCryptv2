<script lang="ts">
  import { getContributorSkins } from "$routes/contributors.remote";
  import * as skinview3d from "skinview3d";
  import { onDestroy } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import { fetchSkinTextures } from "#lib/shared/skin";
  import { cn } from "#lib/shared/utils";

  interface Props {
    class?: string;
    player: Promise<{ uuid?: string; username?: string }>;
    ign: string;
    showStaticSkin: () => void;
  }

  let { class: className, player, ign, showStaticSkin }: Props = $props();

  const contributorSkinsPromise = getContributorSkins(__PRERENDER_VERSION__).catch(() => []);
  let contributorSkins: string[] = [];
  const SPIN_DELAY = 90;
  const LAND_DELAY = 300;

  // Grace period before spinning again, so fast loads keep the current skin
  const RESPIN_DELAY = 150;
  const prefersReducedMotion = new MediaQuery("(prefers-reduced-motion: reduce)");

  let minecraftAvatar = $state<HTMLCanvasElement>();
  let canvasIsLoading = $state<boolean>(true);

  let viewer: skinview3d.SkinViewer | undefined;
  let loadedUuid = "";
  let loadedUsername = "";
  let updateRequest = 0;
  let spinId = 0;
  let spinCount = 0;
  let skinIndex = -1;
  let destroyed = false;
  let resizeObserver: ResizeObserver | undefined;
  let resizeAnimationFrameId: number | null = null;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  function updateViewerSize() {
    if (!viewer || !minecraftAvatar?.parentElement) return;
    const { clientWidth, clientHeight } = minecraftAvatar.parentElement;
    if (clientWidth > 0 && clientHeight > 0) {
      viewer.setSize(clientWidth, clientHeight);
    }
  }

  function throttledUpdateViewerSize() {
    if (resizeAnimationFrameId !== null) return;
    resizeAnimationFrameId = requestAnimationFrame(() => {
      updateViewerSize();
      resizeAnimationFrameId = null;
    });
  }

  function createViewer(canvas: HTMLCanvasElement) {
    const parent = canvas.parentElement;
    const skinViewer = new skinview3d.SkinViewer({
      canvas,
      width: parent?.clientWidth || 300,
      height: parent?.clientHeight || 600,
      animation: new skinview3d.IdleAnimation(),
      preserveDrawingBuffer: true
    });

    skinViewer.camera.position.set(-18, -3, 78);
    skinViewer.controls.enableZoom = false;
    skinViewer.controls.enablePan = true;
    skinViewer.controls.enableRotate = true;
    skinViewer.canvas.removeAttribute("tabindex");
    return skinViewer;
  }

  async function showNextContributorSkin() {
    if (contributorSkins.length === 0) return;
    skinIndex =
      skinIndex < 0 ? Math.floor(Math.random() * contributorSkins.length) : (skinIndex + 1) % contributorSkins.length;
    await viewer?.loadSkin(contributorSkins[skinIndex]);
    canvasIsLoading = false;
  }

  async function spin() {
    const id = ++spinCount;
    spinId = id;
    loadedUuid = "";
    loadedUsername = "";
    viewer?.resetCape();
    contributorSkins = await contributorSkinsPromise;
    if (destroyed || spinId !== id) return;
    await showNextContributorSkin();
    while (contributorSkins.length > 0 && !prefersReducedMotion.current) {
      await sleep(SPIN_DELAY);
      if (destroyed || spinId !== id) return;
      await showNextContributorSkin();
    }
  }

  const updateSkinViewer = async (targetUuid: string, username: string, requestId: number) => {
    const isStale = () => destroyed || requestId !== updateRequest || !viewer;
    if (loadedUuid === targetUuid) return;

    try {
      const { skinUrl, capeUrl } = await fetchSkinTextures(targetUuid);
      if (isStale()) return;

      // Download the skin during the slowdown; crossOrigin matches skinview3d so its load hits the cache
      const preload = new Image();
      preload.crossOrigin = "anonymous";
      preload.src = skinUrl;

      if (spinId !== 0) {
        spinId = 0;
        if (!prefersReducedMotion.current) {
          let delay = SPIN_DELAY;
          while ((delay *= 1.4) < LAND_DELAY) {
            await sleep(delay);
            if (isStale()) return;
            await showNextContributorSkin();
          }
          await sleep(delay);
          if (isStale()) return;
        }
      }

      await viewer!.loadSkin(skinUrl);

      if (isStale()) return;

      if (capeUrl) {
        await viewer!.loadCape(capeUrl);
      } else {
        viewer!.resetCape();
      }

      loadedUuid = targetUuid;
      loadedUsername = username.toLowerCase();
      canvasIsLoading = false;

      requestAnimationFrame(updateViewerSize);
    } catch (e) {
      if (isStale()) return;
      console.error("Error loading skin viewer:", e);
      spinId = 0;
      canvasIsLoading = false;
      showStaticSkin();
    }
  };

  $effect(() => {
    if (!minecraftAvatar) return;
    viewer ??= createViewer(minecraftAvatar);

    const requestId = ++updateRequest;
    const routePlayer = ign.toLowerCase().replaceAll("-", "");
    const spinTimer =
      loadedUuid && (routePlayer === loadedUuid || routePlayer === loadedUsername)
        ? undefined
        : setTimeout(spin, loadedUuid ? RESPIN_DELAY : 0);
    player.then(
      ({ uuid: targetUuid, username = "" }) => {
        clearTimeout(spinTimer);
        if (requestId !== updateRequest) return;
        if (targetUuid) {
          updateSkinViewer(targetUuid, username, requestId);
        } else {
          spinId = 0;
        }
      },
      () => {
        clearTimeout(spinTimer);
        if (requestId !== updateRequest) return;
        spinId = 0;
        canvasIsLoading = true;
      }
    );

    return () => clearTimeout(spinTimer);
  });

  $effect(() => {
    const parent = minecraftAvatar?.parentElement;
    if (!parent) return;

    resizeObserver = new ResizeObserver(throttledUpdateViewerSize);
    resizeObserver.observe(parent);

    return () => {
      resizeObserver?.disconnect();
      if (resizeAnimationFrameId !== null) {
        cancelAnimationFrame(resizeAnimationFrameId);
        resizeAnimationFrameId = null;
      }
    };
  });

  onDestroy(() => {
    destroyed = true;
    updateRequest += 1;
    spinId = 0;
    if (resizeAnimationFrameId !== null) {
      cancelAnimationFrame(resizeAnimationFrameId);
    }
    resizeObserver?.disconnect();
    viewer?.dispose();
    viewer = undefined;
  });
</script>

<div
  class={cn(
    "relative size-full overflow-hidden opacity-0 data-[loading=false]:motion-preset-focus data-[loading=false]:motion-preset-slide-right data-[loading=false]:opacity-100",
    className
  )}
  data-loading={canvasIsLoading}>
  <canvas bind:this={minecraftAvatar} class="block size-full"></canvas>
</div>
