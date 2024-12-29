<script lang="ts">
  import HeaderInfo from "$lib/components/header/Info.svelte";
  import Settings from "$lib/components/header/Settings.svelte";
  import { Avatar, Button } from "bits-ui";
</script>

<header class="fixed left-0 top-0 z-[1000] h-12 w-full overflow-clip bg-header px-2.5 pl-[max(0.625rem,env(safe-area-inset-left))] pr-[max(0.625rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top,0)] leading-[3rem] @container">
  <div class="flex h-full w-full justify-center @md:justify-between">
    <div class="flex gap-2">
      <Button.Root href="/" class="flex items-center justify-center gap-2 font-bold">
        <Avatar.Root class="size-6 shrink-0 select-none rounded-lg">
          <Avatar.Image src="/img/app-icons/svg.svg" alt="SkyCrypt" class="pointer-events-none h-6 select-none" />
          <Avatar.Fallback class="flex h-full items-center justify-center text-lg font-semibold uppercase text-text/60">SC</Avatar.Fallback>
        </Avatar.Root>
        SkyCrypt
      </Button.Root>
      <HeaderInfo />
    </div>

    <!-- TODO: Implement player lookup
  <form class="lookup-player hidden">
    <input text-text/70="ign" type="search" enterkeyhint="go" placeholder="Enter usertext-text/70" aria-label="usertext-text/70" required />
    <button type="submit">
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <title>search</title>
        <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
      </svg>
    </button>
  </form> -->

    <Settings />
  </div>
</header>
