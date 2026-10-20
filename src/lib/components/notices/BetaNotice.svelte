<script lang="ts">
  import { getHoverContext } from "$ctx";
  import * as Dialog from "$ui/dialog";
  import * as Drawer from "$ui/drawer";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import { Button } from "#lib/components/ui/button";
  import { switchReleaseChannel } from "#lib/shared/release-channel";

  const isHover = getHoverContext();
  let noticeOpen = $state(false);
</script>

<footer
  class="fixed -bottom-0.5 left-0 z-0 w-full p-[env(safe-area-inset-top,0)] pr-[max(0.625rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom,0)] pl-[max(0.625rem,env(safe-area-inset-left))] leading-12 interact:z-50">
  <Button
    variant="ghost"
    class="relative mx-auto w-fit border! border-border glass transition-[scale] duration-150 ease-out glass-bg-popover interact:scale-95 "
    onpointerdown={() => (noticeOpen = !noticeOpen)}>
    <p class="flex items-center gap-x-1.5"><TriangleAlert class="size-5" />You are using the SkyCrypt beta</p>
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
    <Drawer.Content class="gap-4 p-6 before:glass before:glass-bg-popover standard:dark:before:bg-transparent">
      <Drawer.Title>Beta Notice</Drawer.Title>
      {@render notice?.()}
    </Drawer.Content>
  </Drawer.Root>
{/snippet}

{#snippet notice()}
  <p>
    You're using the beta version of SkyCrypt. It has the latest features and updates, but it may also have bugs or
    unfinished features.
  </p>
  <p>
    Please report any issues you run into. You can go back to the stable version at any time, or later with Beta Version
    in the settings.
  </p>
  <Button onclick={switchReleaseChannel}>Switch to stable</Button>
{/snippet}
