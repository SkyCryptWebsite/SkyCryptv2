<script lang="ts">
  import { getProfileContext } from "$ctx";
  import { cn } from "$lib/shared/utils";
  import ky from "ky";
  import * as skinview3d from "skinview3d";
  import { onDestroy } from "svelte";

  interface Props {
    class?: string;
    showStaticSkin: () => void;
  }

  interface ProfileResponse {
    properties: { name: string; value: string; signature?: string }[];
  }

  let { class: className, showStaticSkin }: Props = $props();

  const ctx = $derived(getProfileContext().current);
  const uuid = $derived(ctx?.uuid);

  let minecraftAvatar = $state<HTMLCanvasElement>();
  let canvasIsLoading = $state<boolean>(true);

  let viewer: skinview3d.SkinViewer | undefined;
  let loadedUuid = "";
  let updateRequest = 0;
  let destroyed = false;
  let resizeObserver: ResizeObserver | undefined;
  let resizeAnimationFrameId: number | null = null;

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

  function sanitizeUrl(url?: string): string | undefined {
    return url ? url.replace(/^http:/, "https:") : undefined;
  }

  const updateSkinViewer = async (targetUuid: string) => {
    const requestId = ++updateRequest;
    if (loadedUuid === targetUuid || !minecraftAvatar) return;
    canvasIsLoading = true;

    try {
      const capeData = await ky(
        `https://mowojang.seraph.si/session/minecraft/profile/${targetUuid}`
      ).json<ProfileResponse>();

      if (destroyed || requestId !== updateRequest || !minecraftAvatar) return;

      const texturesProperty = capeData.properties.find((prop) => prop.name === "textures");

      if (!texturesProperty?.value) {
        throw new Error("No texture properties found");
      }

      const texturesJson = JSON.parse(atob(texturesProperty.value));
      const skinUrl = sanitizeUrl(texturesJson.textures?.SKIN?.url);
      const capeUrl = sanitizeUrl(texturesJson.textures?.CAPE?.url);

      if (!skinUrl) {
        throw new Error("No skin URL present in texture payload");
      }

      if (!viewer) {
        const parent = minecraftAvatar.parentElement;
        viewer = new skinview3d.SkinViewer({
          canvas: minecraftAvatar,
          width: parent?.clientWidth || 300,
          height: parent?.clientHeight || 600,
          animation: new skinview3d.IdleAnimation(),
          preserveDrawingBuffer: true
        });

        viewer.camera.position.set(-18, -3, 78);
        viewer.controls.enableZoom = false;
        viewer.controls.enablePan = true;
        viewer.controls.enableRotate = true;
        viewer.canvas.removeAttribute("tabindex");
      }

      await viewer.loadSkin(skinUrl);

      if (destroyed || requestId !== updateRequest || !minecraftAvatar) return;

      if (capeUrl) {
        await viewer.loadCape(capeUrl);
      } else {
        viewer.resetCape();
      }

      loadedUuid = targetUuid;
      canvasIsLoading = false;

      requestAnimationFrame(updateViewerSize);
    } catch (e) {
      if (destroyed || requestId !== updateRequest) return;
      console.error("Error loading skin viewer:", e);
      canvasIsLoading = false;
      showStaticSkin();
    }
  };

  $effect(() => {
    if (uuid) {
      updateSkinViewer(uuid);
    }
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
