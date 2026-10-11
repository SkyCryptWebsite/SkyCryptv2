<script lang="ts">
  import { authClient } from "$src/lib/shared/auth-client";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Collapsible from "$ui/collapsible";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import SvelteSeo from "svelte-seo";
  import Captcha from "#lib/components/Captcha.svelte";

  let turnstileToken: string | undefined = $state();

  const signIn = async () => {
    if (!turnstileToken) {
      console.error("Captcha token is missing. Please complete the captcha.");
      return;
    }
    await authClient.signIn.social({
      provider: "discord",
      callbackURL: "/dashboard",
      fetchOptions: {
        headers: {
          "x-captcha-response": turnstileToken
        }
      }
    });
  };
</script>

<SvelteSeo title="Sign in | SkyCrypt" noindex={true} nofollow={true} />

<main
  class="@container mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col items-center-safe justify-center-safe pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))]">
  <Card.Root
    class="w-full max-w-md glass glass-brightness-150 glass-contrast-60 dark:glass-brightness-50 dark:glass-contrast-100 standard:bg-transparent">
    <Card.Header class="flex flex-col items-center gap-2">
      <Avatar.Root class="size-16 select-none">
        <Avatar.Image
          loading="eager"
          src="/img/app-icons/svg.svg"
          alt="SkyCrypt"
          class="pointer-events-none size-16 rounded-xl" />
        <Avatar.Fallback>SC</Avatar.Fallback>
      </Avatar.Root>
      <Card.Title>Sign in to <span class="text-primary">SkyCrypt</span></Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex w-full flex-col items-center gap-2">
        <Button
          disabled={!turnstileToken}
          onclick={signIn}
          class="w-full bg-[#5865F2] duration-300 hover:bg-[#5865F2] focus-visible:outline-[#5865F2] interact:scale-95 disabled:interact:scale-100">
          <img
            src="/img/icons/discord.svg"
            alt=""
            aria-hidden="true"
            draggable="false"
            class="pointer-events-none size-5 select-none" />
          <span>Continue with Discord</span>
        </Button>
        <Captcha bind:turnstileToken />
      </div>
    </Card.Content>
    <Card.Footer>
      <Collapsible.Root class="relative w-full rounded-xl border p-2">
        <Collapsible.Trigger class="group/collapisble hit-area-2 hit-area-y-2 flex w-full items-center-safe">
          <ChevronDownIcon
            class="mr-2 size-4 text-sm text-muted-foreground transition-[rotate] duration-150 ease-out group-data-[state=open]/collapisble:-rotate-180"
            aria-hidden="true" />
          What information do we request?
        </Collapsible.Trigger>
        <Collapsible.Content class="mt-2 text-xs text-balance text-muted-foreground">
          We only request your basic Discord profile (username, avatar, and banner). <br /> We do not access your email
          or any other personal information. <br /> <br /> If this is not the case, then you may be a victim of a phishing
          attempt.
        </Collapsible.Content>
      </Collapsible.Root>
    </Card.Footer>
  </Card.Root>
</main>
