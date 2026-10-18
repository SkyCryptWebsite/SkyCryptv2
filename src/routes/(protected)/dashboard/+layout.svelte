<script lang="ts">
  import { page } from "$app/state";
  import * as Alert from "$ui/alert";
  import * as Breadcrumb from "$ui/breadcrumb";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import { Separator } from "$ui/separator";
  import * as Sidebar from "$ui/sidebar";
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import type { LayoutProps } from "./$types";
  import AppSidebar from "./dashboard-sidebar.svelte";

  let { children }: LayoutProps = $props();

  function generateBreadcrumbs() {
    const breadcrumbs = [];
    const pathSegments = page.url.pathname.split("/").filter(Boolean);
    let accumulatedPath = "";

    for (const segment of pathSegments) {
      accumulatedPath += `/${segment}`;
      breadcrumbs.push({
        name: segment.replace(/-/g, " "),
        href: accumulatedPath
      });
    }

    return breadcrumbs;
  }
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Sidebar.Provider class="min-h-[calc(100svh-3rem)] antialiased">
  <AppSidebar />
  <main class="min-w-0 flex-1 text-pretty">
    <header
      class="flex h-16 items-center gap-2 border-b bg-sidebar px-4 sm:px-8 standard:glass standard:bg-transparent">
      <Sidebar.Trigger class="size-11" />
      <Separator orientation="vertical" class="me-2 data-vertical:h-4 data-vertical:self-auto" />

      <Breadcrumb.Root>
        <Breadcrumb.List>
          {#each generateBreadcrumbs() as breadcrumb, index (breadcrumb.href)}
            <Breadcrumb.Item>
              <Breadcrumb.Link href={breadcrumb.href} class="capitalize">
                {breadcrumb.name}
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            {#if index < generateBreadcrumbs().length - 1}
              <Breadcrumb.Separator />
            {/if}
          {/each}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </header>

    <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-10">
      {#if page.url.searchParams.has("error")}
        <Alert.Root class="standard:glass standard:bg-transparent">
          <Alert.Title>Account linking failed</Alert.Title>
          <Alert.Description>
            Account linking could not be completed. Please try linking your account again.
          </Alert.Description>
        </Alert.Root>
      {/if}
      {#key page.url.pathname}
        <svelte:boundary>
          {#snippet pending()}
            <div class="mx-auto h-fit w-fit" role="status" aria-label="Loading dashboard">
              <Loader2Icon class="size-16 animate-spin text-muted-foreground" />
            </div>
          {/snippet}
          {#snippet failed(_error, reset)}
            <Card.Root class="standard:glass standard:bg-transparent">
              <Card.Header>
                <Card.Title>Dashboard unavailable</Card.Title>
                <Card.Description>We couldn’t load your account details. Please try again.</Card.Description>
              </Card.Header>
              <Card.Footer>
                <Button onclick={reset}>Try again</Button>
              </Card.Footer>
            </Card.Root>
          {/snippet}
          {@render children()}
        </svelte:boundary>
      {/key}
    </div>
  </main>
</Sidebar.Provider>
