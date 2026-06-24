<script lang="ts">
  import { page } from "$app/state";
  import { JsonLd } from "$lib/components/misc";
  import type { ModelsEmbedData } from "$lib/shared/api/orval-generated";
  import { getLongDescription, getMetaTitle, getShortDescription } from "$lib/shared/embedGenerator";
  import { mode } from "mode-watcher";
  import SvelteSeo from "svelte-seo";

  const { embedData }: { embedData: ModelsEmbedData } = $props();
  const isValidEmbed = $derived(!!embedData.username);
  const isStatsPage = $derived(page.url.pathname.includes("/stats/"));
  const routeIgn = $derived(page.params.ign);
  const routeProfile = $derived(page.params.profile);
  const profileIdentifier = $derived(routeIgn || embedData.username || embedData.uuid || "unknown");
  const canonicalPath = $derived(routeProfile ? `/stats/${encodeURIComponent(profileIdentifier)}/${encodeURIComponent(routeProfile)}` : `/stats/${encodeURIComponent(profileIdentifier)}`);
  const canonicalUrl = $derived(`https://sky.shiiyu.moe${canonicalPath}`);
  const profileDescription = $derived(isStatsPage && !isValidEmbed ? getShortDescription(embedData) : getLongDescription(embedData));
  const profileImage = $derived(`https://nmsr.nickac.dev/bust/${embedData.uuid}?y=-20`);
  const themeColor = $derived(embedData.rank?.plusColor || embedData.rank?.rankColor || (mode.current === "light" ? "#dbdbdb" : "#282828"));

  const breadcrumbJsonLd = $derived({
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://sky.shiiyu.moe/"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Stats",
        item: "https://sky.shiiyu.moe/stats"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: embedData.username || profileIdentifier,
        item: canonicalUrl
      }
    ]
  } as const);
  const profileJsonLd = $derived({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonicalUrl}#profilepage`,
    name: getMetaTitle(embedData) || profileIdentifier,
    description: profileDescription,
    url: canonicalUrl,
    mainEntity: {
      "@type": "Person",
      "@id": `${canonicalUrl}#person`,
      name: embedData.username || profileIdentifier,
      alternateName: embedData.username || profileIdentifier,
      image: profileImage,
      url: canonicalUrl
    },
    breadcrumb: breadcrumbJsonLd
  } as const);
</script>

<svelte:head>
  {#if embedData.uuid}
    <link rel="icon" href={isStatsPage ? `https://nmsr.nickac.dev/face/${embedData.uuid}` : `https://nmsr.nickac.dev/bust/${embedData.uuid}?y=-20`} sizes="32x32" type="image/png" />
  {/if}
</svelte:head>

<SvelteSeo
  title="{embedData.displayName || profileIdentifier} | SkyCrypt"
  description={profileDescription}
  canonical={canonicalUrl}
  openGraph={{
    title: getMetaTitle(embedData),
    description: getLongDescription(embedData),
    type: "profile",
    profile: {
      username: embedData.username
    },
    images: [
      {
        url: profileImage,
        width: 512,
        height: 512,
        alt: embedData.displayName
      }
    ],
    site_name: `SkyCrypt ${__NPM_PACKAGE_VERSION__ ? `• v${__NPM_PACKAGE_VERSION__}` : ""}`
  }}
  twitter={{
    card: "summary",
    image: profileImage,
    imageAlt: embedData.displayName,
    title: getMetaTitle(embedData),
    description: getLongDescription(embedData)
  }}
  {themeColor}
  manifest="/manifest.webmanifest" />

<JsonLd data={profileJsonLd} />
