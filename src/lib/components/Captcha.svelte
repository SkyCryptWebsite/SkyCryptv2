<script lang="ts">
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$app/env/public";
  import Turnstile from "@better-captcha/svelte/provider/turnstile";

  type Props = {
    turnstileToken: string | undefined;
  };

  let { turnstileToken = $bindable() }: Props = $props();
  let turnstileReady = $state(false);
  let turnstileErrored: boolean = $state(false);
</script>

<!-- Tokens are passed explicitly; Turnstile's injected `cf-turnstile-response` input breaks SvelteKit remote forms. -->
<Turnstile
  sitekey={PUBLIC_TURNSTILE_SITE_KEY}
  options={{ "response-field": false }}
  onready={() => {
    turnstileReady = true;
  }}
  onerror={(error) => {
    console.error("Captcha Error:", error);
    turnstileErrored = true;
  }}
  onSolve={(token) => {
    turnstileToken = token;
  }} />

{#if turnstileErrored}
  <p class="text-center text-xs text-destructive">Captcha failed to load. Please refresh the page and try again.</p>
{:else if turnstileReady && !turnstileToken}
  <p class="shimmer text-center text-xs text-muted-foreground">Please complete the captcha to continue...</p>
{/if}
{#if !turnstileReady}
  <p class="shimmer text-center text-xs text-muted-foreground">Loading captcha...</p>
{/if}
