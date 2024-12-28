<script lang="ts">
  import type { ProcessedSkyBlockItem } from "$lib/types/global";
  import { Avatar } from "bits-ui";
  import Image from "lucide-svelte/icons/image";

  let { piece }: { piece: ProcessedSkyBlockItem } = $props();
</script>

<div class="data-[enchanted=true]:shine relative flex aspect-square items-center justify-center overflow-clip rounded-lg p-0" data-enchanted={piece.shiny}>
  <Avatar.Root>
    <Avatar.Image loading="lazy" src={piece.texture_path} alt={piece.display_name} class="group-data-[enchanted=true]:enchanted h-auto w-14 select-none" />
    <Avatar.Fallback>
      <Image class="size-8" />
    </Avatar.Fallback>
  </Avatar.Root>
</div>
