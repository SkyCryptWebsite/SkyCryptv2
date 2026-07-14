<script lang="ts">
  import { getProfileContext } from "$ctx";
  import { cn } from "$lib/shared/utils";
  import ky from "ky";
  import * as skinview3d from "skinview3d";
  import { onDestroy } from "svelte";

  const ctx = $derived(getProfileContext().current);
  const uuid = $derived(ctx?.uuid);

  let { class: className, showStaticSkin }: { class: string | undefined; showStaticSkin: () => void } = $props();
  let viewer = $state<skinview3d.SkinViewer>();
  let minecraftAvatar = $state<HTMLCanvasElement>();
  let canvasIsLoading = $state<boolean>(true);
  let loadedUuid = "";

  const FIXED_WIDTH = 500;
  const FIXED_HEIGHT = 1000;

  function updateViewerSize() {
    if (minecraftAvatar && minecraftAvatar.parentElement && viewer) {
      viewer.setSize(minecraftAvatar.parentElement.clientWidth, window.innerHeight);
    }
  }

  const updateSkinViewer = async (uuid: string) => {
    if (loadedUuid === uuid) return;
    canvasIsLoading = true;

    const capeData = await ky(`https://mowojang.seraph.si/session/minecraft/profile/${uuid}`).json<{
      properties: { name: string; value: string; signature?: string }[];
    }>();
    const texturesProperty = capeData.properties.find((prop) => prop.name === "textures");

    if (!texturesProperty) {
      canvasIsLoading = false;
      showStaticSkin();
      return;
    }

    // Decode the Base64 value
    const decodedValue = atob(texturesProperty.value);
    const texturesJson = JSON.parse(decodedValue);
    const skin = texturesJson.textures.SKIN;
    if (skin?.url) skin.url = skin.url.replace(/^http:/, "https:");

    const cape = texturesJson.textures.CAPE;
    if (cape?.url) cape.url = cape.url.replace(/^http:/, "https:");
    const hasCape = cape !== undefined;

    if (!viewer) {
      viewer = new skinview3d.SkinViewer({
        canvas: minecraftAvatar,
        width: FIXED_WIDTH,
        height: FIXED_HEIGHT,
        animation: new skinview3d.IdleAnimation(),
        preserveDrawingBuffer: true
      });
    }

    await viewer.loadSkin(skin.url);
    if (hasCape) {
      await viewer.loadCape(cape.url);
    } else {
      viewer.resetCape();
    }

    viewer.camera.position.set(-18, -3, 78);
    viewer.controls.enableZoom = false;
    viewer.controls.enablePan = true;
    viewer.controls.enableRotate = true;
    viewer.canvas.removeAttribute("tabindex");

    canvasIsLoading = false;
  };

  $effect.pre(() => {
    try {
      if (uuid) updateSkinViewer(uuid);
    } catch (e) {
      showStaticSkin();
      console.error("Error loading skin viewer:", e);
    }
    updateViewerSize();
    return () => viewer?.dispose();
  });

  onDestroy(() => {
    viewer?.dispose();
  });
</script>

<svelte:window onresize={updateViewerSize} />

<canvas
  bind:this={minecraftAvatar}
  class={cn(
    "size-full transform-gpu overflow-hidden opacity-0 data-[loading=false]:motion-preset-focus data-[loading=false]:motion-preset-slide-right data-[loading=false]:opacity-100",
    className
  )}
  data-loading={canvasIsLoading}></canvas>
