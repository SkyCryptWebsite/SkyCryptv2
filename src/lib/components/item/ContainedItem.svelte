<script lang="ts">
  import type { ModelsStrippedItem } from "$lib/shared/api/orval-generated";
  import { cn } from "$lib/shared/utils";
  import Image from "@lucide/svelte/icons/image";
  import { Avatar } from "bits-ui";
  import ResolvedItemImage from "./ResolvedItemImage.svelte";

  let { piece, isInventory }: { piece: ModelsStrippedItem; isInventory?: boolean } = $props();
</script>

<div class="relative flex aspect-square items-center justify-center overflow-clip p-0">
  <div class="absolute inset-0 rounded-xl"></div>
  <Avatar.Root>
    <ResolvedItemImage
      loading="lazy"
      src={piece.texture_path}
      alt={piece.display_name}
      class={cn(
        "h-auto w-14 select-none [image-rendering:pixelated] data-[enchanted=true]:enchanted",
        isInventory ? "w-8" : "w-14"
      )} />
    <Avatar.Fallback>
      <Image class={cn(isInventory ? "size-8" : "size-14")} />
    </Avatar.Fallback>
  </Avatar.Root>
</div>
