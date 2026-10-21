<script lang="ts">
  import { page } from "$app/state";
  import * as Breadcrumb from "$ui/breadcrumb";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import { Separator } from "$ui/separator";
  import * as Sidebar from "$ui/sidebar";
  import { Spinner } from "$ui/spinner";
  import type { LayoutProps } from "./$types";
  import AdminSidebar from "./admin-sidebar.svelte";
  import { ADMIN_BASE, pageTitles } from "./nav";

  let { children }: LayoutProps = $props();

  // The section is the first segment after the base, e.g. /admin-dashboard/users/123 → Users.
  const section = $derived(page.url.pathname.split("/").slice(0, 3).join("/"));
  const sectionTitle = $derived(pageTitles[section]);
  const isOverview = $derived(section === ADMIN_BASE);
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Sidebar.Provider class="min-h-[calc(100svh-3rem)]">
  <AdminSidebar />
  <Sidebar.Inset class="min-w-0">
    <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <Sidebar.Trigger class="-ms-1" />
      <Separator orientation="vertical" class="me-2 data-vertical:h-4 data-vertical:self-auto" />
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item class="hidden md:block">
            {#if isOverview}
              <Breadcrumb.Page>Overview</Breadcrumb.Page>
            {:else}
              <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
              <Breadcrumb.Link href={ADMIN_BASE}>Admin</Breadcrumb.Link>
            {/if}
          </Breadcrumb.Item>
          {#if !isOverview && sectionTitle}
            <Breadcrumb.Separator class="hidden md:block" />
            <Breadcrumb.Item>
              {#if page.url.pathname === section}
                <Breadcrumb.Page>{sectionTitle}</Breadcrumb.Page>
              {:else}
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                <Breadcrumb.Link href={section}>{sectionTitle}</Breadcrumb.Link>
              {/if}
            </Breadcrumb.Item>
          {/if}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </header>
    <main class="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {#key page.url.pathname}
        <svelte:boundary>
          {@render children()}
          {#snippet pending()}
            <div class="flex flex-1 items-center justify-center py-24" role="status" aria-label="Loading">
              <Spinner class="size-6 text-muted-foreground" />
            </div>
          {/snippet}
          {#snippet failed(error, reset)}
            <Card.Root class="mx-auto w-full max-w-md">
              <Card.Header>
                <Card.Title>Something went wrong</Card.Title>
                <Card.Description>
                  {(error as { body?: { message?: string } })?.body?.message ?? "This page couldn’t be loaded."}
                </Card.Description>
              </Card.Header>
              <Card.Footer>
                <Button onclick={reset}>Try again</Button>
              </Card.Footer>
            </Card.Root>
          {/snippet}
        </svelte:boundary>
      {/key}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
