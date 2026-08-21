<script lang="ts">
  import { getHoverContext, getProfileContext } from "$ctx";
  import * as Dialog from "$ui/dialog";
  import * as Drawer from "$ui/drawer";

  const profile = $derived(getProfileContext().current);

  const apiSettings = $derived(Object.entries(profile?.apiSettings ?? {}).filter(([_, value]) => !value));

  const isHover = getHoverContext();
</script>

<div class="mx-auto w-full max-w-lg overflow-clip">
  <div class="bg-primary py-1 text-center text-xl font-semibold uppercase">Notice</div>
  <div class="p-5 text-center text-base font-medium text-pretty">
    <p>
      {#each apiSettings as [key, _], index (index)}
        {#if index === apiSettings.length - 1 && index > 0}
          &nbsp;and
        {/if}
        <span class="inline-block whitespace-nowrap capitalize">{key.replaceAll("_", " ")}</span
        >{#if index < apiSettings.length - 1},{/if}
      {/each}
      {apiSettings.length === 1 ? "is" : "are"} not available for {profile?.username} due to limited API access.
    </p>
    <p>
      {#if isHover.current}
        {@render modal()}
      {:else}
        {@render drawer()}
      {/if}
      how to enable full API access.
    </p>
  </div>
</div>

{#snippet video()}
  <video
    preload="metadata"
    poster="/img/enable-api-thumbnail.avif"
    muted
    loop
    disablepictureinpicture
    disableremoteplayback
    controlslist="nodownload noremoteplayback noplaybackrate"
    controls
    autoplay
    playsinline
    class="data-[is-hover=false]:rounded-t-lg data-[is-hover=true]:rounded-none"
    data-is-hover={isHover.current}>
    <!-- Best quality (AV1 in WebM) -->
    <source src="/video/enable-api-av1.webm" type="video/webm; codecs=av01" />

    <!-- AV1 in MP4 (Safari 17+ on new Apple chips) -->
    <source src="/video/enable-api-av1.mp4" type="video/mp4; codecs=av01" />

    <!-- VP9 in WebM (modern fallback) -->
    <source src="/video/enable-api-vp9.webm" type="video/webm; codecs=vp9" />

    <!-- H.264 MP4 (universal fallback) -->
    <source src="/video/enable-api-h264.mp4" type="video/mp4" />

    Your browser does not support the video tag.
  </video>
{/snippet}

{#snippet modal()}
  <Dialog.Root>
    <Dialog.Trigger class="text-primary underline">See here</Dialog.Trigger>
    <Dialog.Content class="w-full overflow-clip p-0 sm:max-w-5xl">
      {@render video()}
    </Dialog.Content>
  </Dialog.Root>
{/snippet}

{#snippet drawer()}
  <Drawer.Root shouldScaleBackground={true} setBackgroundColorOnScale={false}>
    <Drawer.Trigger class="text-primary underline">See here</Drawer.Trigger>

    <Drawer.Content
      class="before:glass before:glass-bg-popover standard:dark:before:bg-transparent [&>div:first-child]:mb-4">
      {@render video()}
    </Drawer.Content>
  </Drawer.Root>
{/snippet}
