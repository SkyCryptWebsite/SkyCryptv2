<script lang="ts">
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import { Avatar, Button } from "bits-ui";
  import { signInSocial } from "./login.remote";
</script>

<main class="@container mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col items-center justify-center gap-6 py-10 pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))]">
  <article class="flex w-full flex-col gap-7 rounded-xl p-8 glass glass-brightness-150 dark:glass-brightness-50 glass-contrast-60 dark:glass-contrast-100">
    <header class="flex flex-col items-center gap-4 text-center">
      <Avatar.Root class="size-16 select-none">
        <Avatar.Image loading="eager" src="/img/app-icons/svg.svg" alt="SkyCrypt" class="pointer-events-none size-16 rounded-2xl" />
        <Avatar.Fallback class="flex size-16 items-center justify-center rounded-2xl bg-foreground/10 text-lg font-semibold text-foreground/60 uppercase">SC</Avatar.Fallback>
      </Avatar.Root>
      <div class="flex flex-col gap-1.5">
        <h1 class="text-2xl font-bold tracking-tight">Sign in to <span class="text-primary">SkyCrypt</span></h1>
      </div>
    </header>

    <form {...signInSocial} class="flex flex-col gap-3">
      <input {...signInSocial.fields.provider.as("hidden", "discord")} />
      <input {...signInSocial.fields.callbackURL.as("hidden", "/login/better-auth")} />

      <Button.Root type="submit" disabled={!!signInSocial.pending} class="flex h-12 items-center justify-center gap-3 rounded-3xl bg-[#5865F2] px-6 text-base font-bold text-white uppercase transition-all duration-150 ease-out text-shadow-[0_0_3px_oklch(0%_0_0/50%)] hover:scale-[1.015] hover:bg-[#4752C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5865F2] disabled:opacity-50 disabled:hover:scale-100">
        {#if signInSocial.pending}
          <LoaderCircle class="size-5 animate-spin" aria-hidden="true" />
          <span>Redirecting…</span>
        {:else}
          <img src="/img/icons/discord.svg" alt="" aria-hidden="true" draggable="false" class="pointer-events-none size-5 select-none" />
          <span>Continue with Discord</span>
        {/if}
      </Button.Root>
    </form>

    <p class=" text-xs font-medium text-balance text-foreground/55">We only request your basic Discord profile (username, avatar, and banner). <br /> We do not access your email or any other personal information. <br /> <br /> If this is not the case, then you may be a victim of a phishing attempt.</p>
  </article>
</main>
