<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { cn } from "$lib/shared/utils";
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
  import CircleX from "@lucide/svelte/icons/circle-x";
  import Info from "@lucide/svelte/icons/info";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
  import * as Sentry from "@sentry/sveltekit";
  import { isHttpError, type HttpError } from "@sveltejs/kit";
  import { Button } from "bits-ui";
  import type { Snippet } from "svelte";

  const { PUBLIC_DISCORD_INVITE } = env;

  type Props = {
    title: string;
    children?: Snippet;
    text?: string;
    type: "error" | "warning" | "info";
    class?: string;
    error?: Error | HttpError | unknown;
    retry?: () => void;
  };

  let { title, children, text, type, class: className, error: fullError, retry }: Props = $props();

  $effect(() => {
    if (fullError) {
      Sentry.captureException(fullError);
      console.error(fullError);
    }
  });
</script>

<div class={cn("space-y-5 rounded-xl p-6 data-[type=error]:text-red-200 data-[type=info]:text-blue-200 data-[type=warning]:text-yellow-200 @[75rem]/parent:p-8", "standard:backdrop-blur-lg standard:data-[type=error]:bg-red-700/5 standard:data-[type=info]:bg-blue-700/5 standard:data-[type=warning]:bg-yellow-700/5 performance:data-[type=error]:bg-red-800 performance:data-[type=info]:bg-blue-800 performance:data-[type=warning]:bg-yellow-800", className)} data-type={type}>
  <div class="justify-starts flex items-center gap-2">
    {#if type === "error"}
      <CircleX class="size-8" />
    {/if}
    {#if type === "warning"}
      <CircleAlert class="size-8" />
    {/if}
    {#if type === "info"}
      <Info class="size-8" />
    {/if}
    <h3 class="text-2xl font-semibold">{title}</h3>
  </div>

  {#if children}
    {@render children?.()}
  {:else if text}
    <p>{text}</p>
  {/if}

  {#if type === "error"}
    {#if isHttpError(fullError)}
      <p class="text-center">
        {fullError.status}
        {fullError.body.message}
      </p>
    {:else if fullError instanceof Error}
      <p class="text-center">
        {fullError.message}
        {fullError.name}
        {fullError.stack}
        {fullError.cause}
      </p>
    {:else}
      <p class="text-center">An unknown error has occurred.</p>
    {/if}

    <p class="text-center">If applicable, please report this error on our <Button.Root target="_blank" href={PUBLIC_DISCORD_INVITE} class="underline">Discord</Button.Root></p>

    {#if retry}
      <div class="flex justify-center">
        <Button.Root onclick={retry} class="group/retry flex items-center gap-1 rounded-full bg-red-700 px-4 py-2 text-white">
          Retry
          <RotateCcw class="h-hl size-4 transition-all duration-150 group-hover/retry:-rotate-90" />
        </Button.Root>
      </div>
    {/if}
  {/if}
</div>
