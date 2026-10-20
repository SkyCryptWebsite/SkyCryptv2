<script lang="ts">
  import { PUBLIC_COMMIT_HASH } from "$app/env/public";
  import { PUBLIC_DISCORD_INVITE, PUBLIC_PATREON } from "$app/env/public";
  import { resolve } from "$app/paths";
  import { Spinner } from "$ui/spinner";
  import SvelteSeo from "svelte-seo";
  import { getSourceInfo } from "#lib/shared/api/skycrypt-api.remote";

  const packageVersion = __NPM_PACKAGE_VERSION__;
  const commitHash = PUBLIC_COMMIT_HASH;
  const prerenderVersion = __PRERENDER_VERSION__;
</script>

<SvelteSeo
  title="About | SkyCrypt"
  description="SkyCrypt is a free, open-source stats viewer for Hypixel SkyBlock."
  canonical="https://sky.shiiyu.moe/about" />

<h1>About SkyCrypt</h1>

<p>SkyCrypt is a free, open-source stats viewer for Hypixel SkyBlock.</p>

<p>
  The original project, <a href="https://sky.lea.moe">sky.lea.moe</a>, was created by
  <a href="https://github.com/LeaPhant" target="_blank" rel="noreferrer">LeaPhant</a>. Thanks for all of what you've
  done Lea!
</p>

<h2>Get involved</h2>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external links -->
<ul>
  <li>
    Join our community, report bugs and suggest features on
    <a href={PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer">Discord</a>.
  </li>
  <li>
    Contribute to the code on <a href="https://github.com/SkyCryptWebsite" target="_blank" rel="noreferrer">GitHub</a>.
  </li>
  <li>
    Help keep SkyCrypt ad free by donating on <a href={PUBLIC_PATREON} target="_blank" rel="noreferrer">Patreon</a>.
  </li>
</ul>
<!-- eslint-enable svelte/no-navigation-without-resolve -->

<h2>Open source</h2>

<p>
  SkyCrypt Frontend is open source under GNU AGPLv3. View the source on
  <a href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend" target="_blank" rel="noreferrer">GitHub</a>.
</p>

<h2>Used resources</h2>

<p>
  SkyCrypt uses textures, data and libraries made by others. See the full list of
  <a href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend#credits" target="_blank" rel="noreferrer"
    >used resources</a> on GitHub.
</p>

<h2>Version</h2>

{#if packageVersion || commitHash}
  <p>
    Frontend version
    {#if packageVersion}<a
        href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/releases/tag/v{packageVersion}"
        target="_blank"
        rel="noreferrer">{packageVersion}</a
      >{/if}
    {#if commitHash}
      <span class="opacity-50">
        {#if packageVersion}({/if}<a
          href="https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/{commitHash}"
          target="_blank"
          rel="noreferrer">{commitHash}</a
        >{#if packageVersion}){/if}
      </span>
    {/if}
  </p>
{:else}
  <p>Version information is not available.</p>
{/if}

<svelte:boundary>
  {#snippet failed()}{/snippet}
  {#snippet pending()}
    <p class="flex items-center gap-2"><Spinner /> Loading backend version information</p>
  {/snippet}
  {const backend = await getSourceInfo()}
  {#if backend?.commit}
    <p>
      Backend version
      {#if backend.repository}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
        <a href="{backend.repository}/commit/{backend.commit}" target="_blank" rel="noreferrer"
          >{backend.commit.slice(0, 7)}</a>
      {:else}
        {backend.commit}
      {/if}
    </p>
  {/if}
</svelte:boundary>

<p>Prerender version <code class="break-all select-text">{prerenderVersion}</code></p>

<h2>Legal</h2>

<ul>
  <li><a href={resolve("/(pages)/terms-of-service")}>Terms of Service</a></li>
  <li><a href={resolve("/(pages)/privacy-policy")}>Privacy Policy</a></li>
  <li><a href={resolve("/(pages)/api-policy")}>API Policy</a></li>
</ul>
