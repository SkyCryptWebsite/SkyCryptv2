<script lang="ts">
  import { page } from "$app/state";
  import { env } from "$env/dynamic/public";
  import { Button } from "$ui/button";
  import * as Empty from "$ui/empty";
  import { Separator } from "$ui/separator";
  import CircleXIcon from "@lucide/svelte/icons/circle-x";
</script>

<main class="flex h-[calc(100vh-3rem)] w-full flex-col items-center justify-center">
  <Empty.Root class="w-full max-w-md grow-0 border glass">
    <Empty.Header class="rounded">
      <Empty.Media variant="icon" class="border bg-inherit">
        <CircleXIcon />
      </Empty.Media>
      <Empty.Title>Oops! Something went wrong</Empty.Title>
      <Empty.Description>An error occurred while trying to fetch the stats for '{page.params.ign}'</Empty.Description>
      <Empty.Description>Try again or contact us if the problem persists.</Empty.Description>
      <Separator />
      <Empty.Description>{page.status}: {page.error?.message}</Empty.Description>
    </Empty.Header>
    <Empty.Content class="flex flex-row items-center-safe justify-center-safe gap-4">
      <Button href="/" variant="default">Go home</Button>
      <Button href={env.PUBLIC_DISCORD_INVITE} variant="outline" target="_blank">Join our Discord</Button>
    </Empty.Content>
  </Empty.Root>
</main>
