<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { env } from "$env/dynamic/public";
  import { Button } from "$ui/button";
  import * as Empty from "$ui/empty";
  import CircleXIcon from "@lucide/svelte/icons/circle-x";
</script>

<main class="flex h-[calc(100vh-3rem)] w-full flex-col items-center justify-center">
  <Empty.Root class="border glass max-w-md w-full grow-0">
    <Empty.Header class="rounded">
      <Empty.Media variant="icon" class="bg-inherit border">
        <CircleXIcon />
      </Empty.Media>
      <Empty.Title>Oops! Something went wrong</Empty.Title>
      <Empty.Description>Try again or contact us if the problem persists.</Empty.Description>
      <Empty.Description>{page.status}: {page.error?.message}</Empty.Description>
    </Empty.Header>
    <Empty.Content class="flex flex-row gap-4 items-center-safe justify-center-safe">
      <Button href={resolve("/newsroom")} variant="default">Back to the Newsroom</Button>
      <Button href={env.PUBLIC_DISCORD_INVITE} variant="outline" target="_blank">Join our Discord</Button>
    </Empty.Content>
  </Empty.Root>
</main>
