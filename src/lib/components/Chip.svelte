<script lang="ts">
  import { cn } from "$lib/utils";
  import { Avatar } from "bits-ui";
  import Image from "lucide-svelte/icons/image";
  import { fade } from "svelte/transition";

  export let animate: boolean = false;
  export let index: number = 0;
  export let amountOfItems: number = 0;

  let classNames = "";
  export { classNames as class };
</script>

<div class={cn("flex w-full max-w-60 items-center gap-2 rounded-lg bg-background/30 p-2", classNames)} in:fade|global={{ duration: animate ? 300 : 0, delay: animate ? 25 * (index + 1) : 0 }} out:fade|global={{ duration: animate ? 300 : 0, delay: animate ? 25 * (amountOfItems - index) : 0 }}>
  <Avatar.Root>
    <Avatar.Image />
    <Avatar.Fallback>
      <Image class="size-10" />
    </Avatar.Fallback>
  </Avatar.Root>

  <slot />
</div>
