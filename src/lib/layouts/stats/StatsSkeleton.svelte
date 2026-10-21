<script lang="ts">
  import { Skeleton } from "$ui/skeleton";
</script>

<!-- Mirrors the right half of Main.svelte while the profile loads -->
<div class="fixed top-12 right-0 min-h-dvh w-full @[75rem]/parent:w-[70%] dark:bg-background/50"></div>
<main class="@container relative mx-auto @[75rem]/parent:ml-[30%]" aria-busy="true">
  <span class="sr-only">Loading profile...</span>
  <div class="space-y-5 p-4 @[75rem]/parent:p-8" aria-hidden="true">
    <div class="flex flex-wrap items-center gap-x-2 gap-y-3">
      <Skeleton class="h-10 w-32" />
      <Skeleton class="h-14 w-56 rounded-full" />
      <Skeleton class="h-10 w-10" />
      <Skeleton class="h-12 w-44 rounded-full" />
    </div>
    <div class="flex flex-wrap gap-2">
      {#each { length: 5 }, index (index)}
        <Skeleton class="h-7 w-28 rounded-full" />
      {/each}
    </div>

    <div class="space-y-2 pr-2 @md:pr-0">
      <Skeleton class="h-11 w-full" />
      <div class="flex flex-col flex-wrap gap-x-4 gap-y-2 @md:flex-row">
        {#each { length: 12 }, index (index)}
          <Skeleton class="h-11 grow basis-full sm:basis-1/3" />
        {/each}
      </div>
    </div>

    <Skeleton class="h-9 w-full" />

    <div class="space-y-2">
      {#each { length: 4 }, index (index)}
        <Skeleton class="h-5" style="width: {80 - index * 12}%" />
      {/each}
    </div>

    {#each { length: 3 }, index (index)}
      <div class="space-y-3 pt-4">
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-48 w-full" />
      </div>
    {/each}
  </div>
</main>
