<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { PUBLIC_COMMIT_HASH } from "$env/static/public";
  import { getBackendSource } from "$lib/shared/api/skycrypt-api.remote";
  import { Spinner } from "$ui/spinner";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import { Button } from "bits-ui";

  const { PUBLIC_DISCORD_INVITE, PUBLIC_PATREON } = env;
  const packageVersion = __NPM_PACKAGE_VERSION__;
  const commitHash = PUBLIC_COMMIT_HASH;
</script>

<p>SkyCrypt is a free, open-source stats viewer for Hypixel SkyBlock.</p>
{#if __NPM_PACKAGE_VERSION__ || PUBLIC_COMMIT_HASH}
  <p>
    Currently running version
    <span class="font-semibold">
      {#if packageVersion}<Button.Root class="text-primary" rel="noreferrer" href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/releases/tag/v{packageVersion}" target="_blank">{packageVersion}</Button.Root>{/if}
      {#if commitHash}
        <span class="opacity-50">
          {#if packageVersion}({/if}<Button.Root class="text-primary" rel="noreferrer" href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/{commitHash}" target="_blank">{commitHash}</Button.Root>{#if packageVersion}){/if}
        </span>
      {/if}
    </span>
  </p>
{:else}
  <p>Version information is not available.</p>
{/if}

<svelte:boundary>
  {#snippet failed()}{/snippet}
  {#snippet pending()}
    <div class="flex items-center gap-2">
      <Spinner />
      Loading backend version information
    </div>
  {/snippet}
  {const backend = await getBackendSource()}
  {#if backend?.commit}
    <p>
      Currently running backend version
      <span class="font-semibold">
        {#if backend.repository}
          <Button.Root class="text-primary" rel="noreferrer" href="{backend.repository}/commit/{backend.commit}" target="_blank">{backend.commit}</Button.Root>
        {:else}
          {backend.commit}
        {/if}
      </span>
    </p>
  {/if}
</svelte:boundary>
<p>
  You can report bugs, suggest features on <Button.Root class="font-semibold text-primary" href={PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer">Discord</Button.Root>, and/or contribute to the code on <Button.Root class="font-semibold text-primary" href="https://github.com/SkyCryptWebsite" target="_blank" rel="noreferrer">GitHub</Button.Root>. It would be much appreciated!
</p>
<p>
  SkyCrypt Frontend is open source under GNU AGPLv3. View the source on <Button.Root class="font-semibold text-primary" href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend" target="_blank" rel="noreferrer">GitHub</Button.Root>.
</p>
<p>
  Join our community on <Button.Root class="font-semibold text-primary" href={PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer">Discord</Button.Root>!
</p>
<p>
  Help keep SkyCrypt ad free by donating on <Button.Root class="font-semibold text-primary" href={PUBLIC_PATREON} target="_blank" rel="noreferrer">Patreon</Button.Root>!
</p>
<p>
  The original project, <Button.Root class="font-semibold text-primary" href="https://sky.lea.moe">sky.lea.moe</Button.Root>, was created by
  <Button.Root class="font-semibold text-primary" href="https://github.com/LeaPhant" target="_blank" rel="noreferrer">LeaPhant</Button.Root>. Thanks for all of what you've done Lea!
</p>
<Button.Root class="flex items-center-safe gap-1 font-semibold text-primary" href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend#credits" target="_blank">
  Used Resources <ExternalLink class="size-4" />
</Button.Root>
