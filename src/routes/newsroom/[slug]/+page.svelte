<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { getNewsroomNotifications } from "$ctx";
  import { clientLocale } from "$lib/hooks/client-locale.svelte";
  import { cn } from "$lib/shared/utils";
  import PostRenderer from "$src/lib/components/newsroom/PostRenderer.svelte";
  import TypeBadge from "$src/lib/components/newsroom/TypeBadge.svelte";
  import type { Author, AuthorView } from "$types";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Star from "@lucide/svelte/icons/star";
  import { Avatar } from "bits-ui";
  import SvelteSeo from "svelte-seo";
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

  function authorOf(author: Author | string): AuthorView {
    if (typeof author === "string") return { id: author, name: "Unknown" };
    return author;
  }

  const post = $derived(data.post);
  const author = $derived(authorOf(post.author));
  const displayName = $derived(author.displayName?.trim() || author.name);
  const initials = $derived(displayName.slice(0, 2).toUpperCase());
  const heroSrc = $derived(post.heroImage?.sizes?.hero?.url ?? post.heroImage?.url ?? null);
  const heroWidth = $derived(post.heroImage?.sizes?.hero?.width ?? post.heroImage?.width ?? undefined);
  const heroHeight = $derived(post.heroImage?.sizes?.hero?.height ?? post.heroImage?.height ?? undefined);
  const heroAlt = $derived(post.heroImage?.alt ?? post.title);

  const ogImages = $derived(heroSrc ? [{ url: heroSrc, width: heroWidth, height: heroHeight, alt: heroAlt }] : []);

  const containerClass = "rounded-xl border glass glass-brightness-150 glass-contrast-60 dark:glass-brightness-50 dark:glass-contrast-100";

  const markCurrentPostSeen = () => {
    if (!data.preview) notifications.markPostSeen(data.post);
  };

  afterNavigate(markCurrentPostSeen);
</script>

<SvelteSeo
  title="{post.title} | SkyCrypt"
  description={post.excerpt ?? post.title}
  canonical="https://sky.shiiyu.moe/newsroom/{post.slug}"
  openGraph={{
    type: "article",
    title: post.title,
    description: post.excerpt ?? post.title,
    site_name: "SkyCrypt",
    images: ogImages,
    article: {
      published_time: post.publishedAt ?? undefined,
      author: [displayName]
    }
  }}
  twitter={{
    card: "summary_large_image",
    title: post.title,
    description: post.excerpt ?? post.title,
    image: heroSrc ?? undefined,
    imageAlt: heroAlt
  }} />

<article class="mx-auto flex max-w-3xl flex-col gap-4 px-[max(1.25rem,env(safe-area-inset-right))] py-8">
  <Button href={resolve("/newsroom")} variant="outline" class="w-fit glass performance:bg-muted!">
    <ArrowLeft class="size-4" />
    Newsroom
  </Button>

  {#if data.preview}
    <div role="status" class="rounded-xl bg-destructive border px-4 py-2.5 text-center text-sm font-bold tracking-wide text-foreground">Draft preview - not visible to public</div>
  {/if}

  {#if heroSrc}
    <div class="aspect-video overflow-hidden rounded-xl border">
      <img src={heroSrc} alt={heroAlt} width={heroWidth} height={heroHeight} loading="lazy" class="size-full object-cover" />
    </div>
  {/if}

  <header class={cn("flex flex-col gap-4 p-4 md:p-8", containerClass)}>
    <div class="flex items-center gap-2">
      <TypeBadge type={post.type} />
      {#if !post.featured}
        <Badge variant="default" class="bg-accent-2/15 border border-accent-2/15 text-accent-2 uppercase font-semibold tracking-wide">
          <Star class="size-3 fill-accent-2" />
          Featured
        </Badge>
      {/if}
    </div>
    <h1 class="text-4xl leading-tight font-bold text-foreground md:text-5xl">{post.title}</h1>
    <div class="flex items-center gap-4 text-sm">
      <Avatar.Root class="size-10 shrink-0">
        {#if author.mcUuid}
          <Avatar.Image loading="lazy" src="https://nmsr.nickac.dev/face/{author.mcUuid}" alt={displayName} class="size-10 [image-rendering:pixelated]" />
        {/if}
        <Avatar.Fallback class="flex size-10 items-center justify-center bg-foreground/10 text-sm font-semibold text-muted-foreground uppercase">{initials}</Avatar.Fallback>
      </Avatar.Root>
      <div class="flex flex-col leading-tight">
        <span class="font-semibold text-foreground">{displayName}</span>
        <time datetime={post.publishedAt} class="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</time>
      </div>
    </div>
    {#if post.tags && post.tags.length > 0}
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
    <PostRenderer body={post.body ?? []} />
  </div>
</article>
