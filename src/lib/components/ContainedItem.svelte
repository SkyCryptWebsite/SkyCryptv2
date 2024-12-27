<script lang="ts">
  import { page } from "$app/stores";
  import { cn } from "$lib/shared/utils";
  import type { ProcessedSkyBlockItem } from "$lib/types/global";
  import { Avatar } from "bits-ui";
  import Image from "lucide-svelte/icons/image";

  export let piece: ProcessedSkyBlockItem;

  const enchanted = piece.shiny;
</script>

<div class={cn(`relative flex aspect-square items-center justify-center overflow-clip rounded-lg p-0`, { shine: enchanted })}>
  <Avatar.Root>
    <Avatar.Image loading="lazy" src={$page.url.origin + piece.texture_path} alt={piece.display_name} class="data-[enchanted=true]:enchanted h-auto w-14 select-none" data-enchanted={enchanted} />
    <Avatar.Fallback>
      <Image class="size-8" />
    </Avatar.Fallback>
  </Avatar.Root>
</div>
