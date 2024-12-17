<script lang="ts">
  import { cn, flyAndScale } from "$lib/shared/utils";
  import { Avatar, Tooltip } from "bits-ui";
  import Image from "lucide-svelte/icons/image";
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

  export let variant: "default" | "tooltip" = "default";
  export let animationOptions: AnimationOptions = { animate: false };
  export let image: ImageProps;

  let classNames = "";
  export { classNames as class };

  const isTooltip = variant === "tooltip";
</script>

<Tooltip.Root group="chip" openDelay={0} closeDelay={0}>
  <Tooltip.Trigger asChild let:builder>
    <div class={cn("flex w-full max-w-60 items-center gap-2 rounded-lg bg-background/30 p-2", classNames)} use:builder.action {...builder} in:fade|global={{ duration: animationOptions.animate ? 300 : 0, delay: animationOptions.animate ? 25 * (animationOptions.index + 1) : 0 }} out:fade|global={{ duration: animationOptions.animate ? 300 : 0, delay: animationOptions.animate ? 25 * (animationOptions.amountOfItems - animationOptions.index) : 0 }}>
      <Avatar.Root>
        <Avatar.Image loading="lazy" src={image.src} class={cn("aspect-square size-12 object-contain", image.class)} />
        <Avatar.Fallback>
          <Image class="size-10" />
        </Avatar.Fallback>
      </Avatar.Root>
      <slot />
    </div>
  </Tooltip.Trigger>
  {#if isTooltip}
    <Tooltip.Content class="z-50 rounded-lg bg-background-grey p-4" transition={flyAndScale} transitionConfig={{ y: 8, duration: 150 }} sideOffset={6} side="top" align="center">
      <slot name="tooltip" />
      <Tooltip.Arrow />
    </Tooltip.Content>
  {/if}
</Tooltip.Root>
