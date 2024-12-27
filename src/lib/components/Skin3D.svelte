<script lang="ts">
  import { getProfileCtx } from "$ctx/profile.svelte";
  import { cn } from "$lib/shared/utils";
  import * as skinview3d from "skinview3d";
  import { onDestroy, onMount } from "svelte";

  const { profile } = getProfileCtx();

  let { class: className }: { class: string | undefined } = $props();
  let viewer: skinview3d.SkinViewer;
  let minecraftAvatar: HTMLCanvasElement;
  let canvasIsLoading = $state<boolean>(true);

  onMount(async () => {
    const minecraftAvatarContainerDimensions = minecraftAvatar.getBoundingClientRect();
    const cape = await fetch(`https://crafatar.com/capes/${profile.uuid}`, {
      method: "HEAD"
    }).catch(() => ({ ok: false }));
    viewer = new skinview3d.SkinViewer({
      canvas: minecraftAvatar,
      width: minecraftAvatarContainerDimensions.width,
      height: minecraftAvatarContainerDimensions.height,
      skin: `https://crafatar.com/skins/${profile.uuid}`,
      cape: cape.ok ? `https://crafatar.com/capes/${profile.uuid}` : undefined,
      animation: new skinview3d.IdleAnimation()
    });

    viewer.camera.position.set(-18, -3, 78);
    viewer.controls.enableZoom = false;
    viewer.controls.enablePan = true;
    viewer.controls.enableRotate = true;
    viewer.canvas.removeAttribute("tabindex");

    canvasIsLoading = false;

    return new Promise((resolve) => {
      resolve(() => {
        viewer.dispose();
      });
    });
  });

  onDestroy(() => {
    canvasIsLoading = true;
    viewer.dispose();
  });
</script>

<canvas bind:this={minecraftAvatar} class={cn("size-full transform-gpu overflow-hidden transition-opacity duration-[3s]", className)} class:opacity-100={!canvasIsLoading} class:opacity-0={canvasIsLoading}></canvas>
