<script lang="ts">
  import { resolve } from "$app/paths";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
  import { API_DOCS_URL } from "#lib/shared/constants/developer";
  import { getDashboard } from "../dashboard.remote";
  import ApiAccess from "./api-access.svelte";

  const developerMode = $derived((await getDashboard()).user.developerMode);
</script>

<svelte:head>
  <title>Developer | SkyCrypt</title>
  <meta name="description" content="Request access to the SkyCrypt API and manage your API key." />
</svelte:head>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <h1 class="text-3xl font-semibold text-balance">API Keys</h1>
      <Card.Description>Manage your API keys and request access to the SkyCrypt API.</Card.Description>
    </Card.Header>
  </Card.Root>

  {#if developerMode}
    <ApiAccess />
  {:else}
    <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
      <Card.Header>
        <Card.Title>Developer mode is off</Card.Title>
        <Card.Description>Turn on developer mode in your account settings to request API access.</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button variant="outline" size="lg" href={resolve("dashboard/settings")}>Open settings</Button>
      </Card.Footer>
    </Card.Root>
  {/if}

  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <Card.Title>API documentation</Card.Title>
      <Card.Description>Learn how to use the SkyCrypt API and what endpoints are available.</Card.Description>
    </Card.Header>
    <Card.Footer>
      <Button variant="outline" size="lg" href={API_DOCS_URL} target="_blank" rel="noopener">
        <BookOpenIcon data-icon="inline-start" />
        Open API docs
        <ExternalLinkIcon data-icon="inline-end" />
        <span class="sr-only">(opens in a new tab)</span>
      </Button>
    </Card.Footer>
  </Card.Root>
</div>
