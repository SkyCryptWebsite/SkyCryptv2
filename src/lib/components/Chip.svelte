<script lang="ts">
  import { cn } from "$lib/utils";
  import { Avatar } from "bits-ui";
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

  export let animationOptions: AnimationOptions = { animate: false };
  export let image: ImageProps;

  let classNames = "";
  export { classNames as class };
</script>

<div class={cn("flex w-full max-w-60 items-center gap-2 rounded-lg bg-background/30 p-2", classNames)} in:fade|global={{ duration: animationOptions.animate ? 300 : 0, delay: animationOptions.animate ? 25 * (animationOptions.index + 1) : 0 }} out:fade|global={{ duration: animationOptions.animate ? 300 : 0, delay: animationOptions.animate ? 25 * (animationOptions.amountOfItems - animationOptions.index) : 0 }}>
  <Avatar.Root>
    <Avatar.Image src={image.src} class={cn("aspect-square size-12 object-contain", image.class)} />
    <Avatar.Fallback>
      <Image class="size-10" />
    </Avatar.Fallback>
  </Avatar.Root>

  <slot />
</div>
