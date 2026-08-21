<script lang="ts">
  import { genericTooltipTether, getInternalState } from "$ctx";
  import { cn } from "$lib/shared/utils";
  import * as Avatar from "$ui/avatar";
  import * as Tooltip from "$ui/tooltip";
  import Image from "@lucide/svelte/icons/image";
  import { IsInViewport } from "runed";
  import { type Snippet } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  type AnimationOptions =
    | {
        animate: true;
        index: number;
        amountOfItems: number;
      }
    | {
        animate: false;
        index?: number;
        amountOfItems?: number;
      };

  type ImageProps = {
    src: string;
    class?: string;
  };

  type Props = {
    animationOptions?: AnimationOptions;
    image?: ImageProps;
    class?: string;
    children?: Snippet;
    progress?: Snippet;
    tooltip?: Snippet;
    tooltipContent?: string;
  };

  let {
    animationOptions = { animate: false },
    image,
    class: classNames,
    children: propsChildren,
    progress,
    tooltip,
    tooltipContent
  }: Props = $props();

  let targetNode = $state<HTMLDivElement>()!;
  let hasBeenInViewport = $state(false);
  let open = $state(false);

  const inViewport = new IsInViewport(() => (image ? targetNode : null), { rootMargin: "200px 0px", threshold: 0 });
  const internalState = getInternalState();

  $effect(() => {
    if (inViewport.current && !hasBeenInViewport) {
      hasBeenInViewport = true;
    }
  });
</script>

<Tooltip.Trigger
  class={cn("flex w-full max-w-fit items-center gap-2 rounded-xl border bg-background/50 py-2", classNames)}
  onpointerdown={() => (open = !open)}
  onclick={() => (internalState.content = tooltip)}
  tether={genericTooltipTether}
  payload={{
    class:
      "z-50 max-w-md space-y-2 rounded-xl border glass bg-transparent p-4 text-sm break-normal wrap-break-word whitespace-normal! glass-bg-popover performance:bg-popover",
    sideOffset: 6,
    side: "top",
    align: "center",
    children: tooltip,
    tooltipContent,
    showTooltip: tooltip != undefined || tooltipContent != undefined
  }}>
  {#snippet child({ props })}
    <div
      {...props}
      bind:this={targetNode}
      in:fade={{
        duration: animationOptions.animate ? 300 : 0,
        delay: animationOptions.animate ? 25 * (animationOptions.index + 1) : 0,
        easing: cubicOut
      }}
      out:fade={{
        duration: animationOptions.animate ? 300 : 0,
        delay: animationOptions.animate ? 25 * (animationOptions.amountOfItems - animationOptions.index) : 0,
        easing: cubicOut
      }}>
      <div class="flex items-center gap-2 px-2">
        {#if image}
          {#if hasBeenInViewport}
            <Avatar.Root class="aspect-square size-12 rounded-none after:border-none">
              <Avatar.Image
                loading="lazy"
                src={image.src}
                class={cn("size-full rounded-none object-contain [image-rendering:pixelated]", image.class)} />
              <Avatar.Fallback>
                <Image class="size-full" />
              </Avatar.Fallback>
            </Avatar.Root>
          {:else}
            <div>
              <Image class="size-12" />
            </div>
          {/if}
        {/if}
        {@render propsChildren?.()}
      </div>
      {@render progress?.()}
    </div>
  {/snippet}
</Tooltip.Trigger>
