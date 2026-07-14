<script lang="ts">
  import { getHoverContext } from "$ctx";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$ui/dialog";
  import * as Drawer from "$ui/drawer";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

  const isHover = getHoverContext();
  let noticeOpen = $state(false);
</script>

<footer
  class="fixed -bottom-0.5 left-0 z-50 w-full p-[env(safe-area-inset-top,0)] pr-[max(0.625rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom,0)] pl-[max(0.625rem,env(safe-area-inset-left))] leading-12">
  <Button
    variant="ghost"
    class="relative mx-auto w-fit border! border-border glass transition-[scale] duration-150 ease-out glass-bg-popover hover:scale-95 "
    onpointerdown={() => (noticeOpen = !noticeOpen)}>
    <p class="flex items-center gap-x-1.5"><TriangleAlert class="size-5" />This is the SkyCrypt development site</p>
  </Button>
</footer>

{#if !isHover.current}
  {@render mobileNotice()}
{:else}
  {@render desktopNotice()}
{/if}

{#snippet desktopNotice()}
  <Dialog.Root bind:open={noticeOpen}>
    <Dialog.Content class="glass glass-bg-popover standard:bg-transparent">
      <Dialog.Title>Beta Notice</Dialog.Title>
      {@render notice()}
    </Dialog.Content>
  </Dialog.Root>
{/snippet}

{#snippet mobileNotice()}
  <Drawer.Root bind:open={noticeOpen} shouldScaleBackground={false} setBackgroundColorOnScale={false}>
    <Drawer.Content class="gap-4 p-6 before:glass before:bg-transparent before:glass-bg-popover">
      <Drawer.Title>Beta Notice</Drawer.Title>
      {@render notice?.()}
    </Drawer.Content>
  </Drawer.Root>
{/snippet}

{#snippet notice()}
  <p>
    You're currently on the SkyCrypt development site (cupcake) This version contains the latest features and updates,
    but it may also have bugs or incomplete functionalities.
  </p>
  <p>
    Please use this site with caution and report any issues you encounter. For the stable version of SkyCrypt (sky),
    please visit <a href="https://sky.shiiyu.moe" class="text-primary underline">sky.shiiyu.moe</a>.
  </p>
{/snippet}
