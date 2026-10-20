<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { getNewsroomNotifications } from "$ctx";
  import PostRenderer from "$src/lib/components/newsroom/PostRenderer.svelte";
  import TypeBadge from "$src/lib/components/newsroom/TypeBadge.svelte";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Star from "@lucide/svelte/icons/star";
  import SvelteSeo from "svelte-seo";
  import { JsonLd } from "#lib/components/misc";
  import UserChip from "#lib/components/misc/UserChip.svelte";
  import { clientLocale } from "#lib/hooks/client-locale.svelte.js";
  import { cn } from "#lib/shared/utils";
  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();
  const notifications = getNewsroomNotifications();

  const dateFormatter = $derived(
    new Intl.DateTimeFormat(clientLocale.current, {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  );

  function formatDate(iso: string | null | undefined): string {
    if (!iso) return "";
    try {
      return dateFormatter.format(new Date(iso));
    } catch {
      return iso;
    }
  }

  const post = $derived(data.post);
  const displayName = $derived(post.author?.minecraft?.username ?? post.author?.name ?? "SkyCrypt");
  const heroSrc = $derived(post.heroImage?.url ?? null);
  const heroWidth = $derived(post.heroImage?.width);
  const heroHeight = $derived(post.heroImage?.height);
  const heroAlt = $derived(post.heroImage?.alt || post.title);
  const seoTitle = $derived(post.seoTitle || post.title);
  const description = $derived(post.seoDescription || post.excerpt || post.title);

  const ogImages = $derived(heroSrc ? [{ url: heroSrc, width: heroWidth, height: heroHeight, alt: heroAlt }] : []);

  const containerClass =
    "rounded-xl border glass glass-brightness-150 glass-contrast-60 dark:glass-brightness-50 dark:glass-contrast-100";

  const markCurrentPostSeen = () => {
    if (!data.preview) notifications.markPostSeen(data.post);
  };

  afterNavigate(markCurrentPostSeen);

  const articleJsonLd = $derived({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `https://sky.shiiyu.moe/newsroom/${post.slug}#article`,
    headline: post.title,
    description,
    url: `https://sky.shiiyu.moe/newsroom/${post.slug}`,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
    image: heroSrc ? [heroSrc] : undefined,
    author: {
      "@type": "Person",
      name: displayName
    },
    publisher: {
      "@type": "Organization",
      name: "SkyCrypt",
      url: "https://sky.shiiyu.moe",
      logo: {
        "@type": "ImageObject",
        url: "https://sky.shiiyu.moe/img/app-icons/512.png"
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://sky.shiiyu.moe/newsroom/${post.slug}`
    }
  } as const);

  const breadcrumbJsonLd = $derived({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://sky.shiiyu.moe"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Newsroom",
        item: "https://sky.shiiyu.moe/newsroom"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://sky.shiiyu.moe/newsroom/${post.slug}`
      }
    ]
  } as const);
</script>

<SvelteSeo
  title="{seoTitle} | SkyCrypt"
  {description}
  canonical="https://sky.shiiyu.moe/newsroom/{post.slug}"
  noindex={data.preview ? true : undefined}
  nofollow={data.preview ? true : undefined}
  openGraph={{
    type: "article",
    title: seoTitle,
    description,
    url: `https://sky.shiiyu.moe/newsroom/${post.slug}`,
    site_name: "SkyCrypt",
    images: ogImages,
    article: {
      published_time: post.publishedAt ?? undefined,
      author: [displayName]
    }
  }}
  twitter={{
    card: "summary_large_image",
    title: seoTitle,
    description,
    image: heroSrc ?? undefined,
    imageAlt: heroAlt
  }} />

<JsonLd data={articleJsonLd} />
<JsonLd data={breadcrumbJsonLd} />

<article class="mx-auto flex max-w-3xl flex-col gap-4 px-[max(1.25rem,env(safe-area-inset-right))] py-8">
  <Button href={resolve("newsroom")} variant="outline" class="w-fit glass performance:bg-muted!"
    ><ArrowLeft class="size-4" />Newsroom</Button>

  {#if data.preview}
    <div
      role="status"
      class="rounded-xl border bg-destructive px-4 py-2.5 text-center text-sm font-bold tracking-wide text-foreground">
      Draft preview - not visible to public
    </div>
  {/if}

  {#if heroSrc}
    <div class="aspect-video overflow-hidden rounded-xl border">
      <img
        src={heroSrc}
        alt={heroAlt}
        width={heroWidth}
        height={heroHeight}
        loading="lazy"
        class="size-full object-cover" />
    </div>
  {/if}

  <header class={cn("flex flex-col gap-4 p-4 md:p-8", containerClass)}>
    <div class="flex items-center gap-2">
      <TypeBadge type={post.type} />
      {#if post.featured}
        <Badge
          variant="default"
          class="border border-accent-2/15 bg-accent-2/15 font-semibold tracking-wide text-accent-2 uppercase">
          <Star class="size-3 fill-accent-2" />
          Featured
        </Badge>
      {/if}
    </div>
    <h1 class="text-4xl leading-tight font-bold text-foreground md:text-5xl">{post.title}</h1>
    <div class="flex items-center gap-4 text-sm">
      <UserChip profile={post.author} size="lg" class="font-semibold text-foreground" />
      <time datetime={post.publishedAt ?? undefined} class="text-muted-foreground">{formatDate(post.publishedAt)}</time>
    </div>
    {#if post.tags.length > 0}
      <div class="flex flex-wrap gap-1.5">
        {#each post.tags as tag (tag)}
          <Badge variant="outline">
            #{tag}
          </Badge>
        {/each}
      </div>
    {/if}
  </header>

  <div class={cn("p-4 md:p-8", containerClass)}>
    <PostRenderer html={post.html} />
  </div>
</article>
