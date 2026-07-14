<script lang="ts">
  import TypeBadge from "$lib/components/newsroom/TypeBadge.svelte";
  import { clientLocale } from "$lib/hooks/client-locale.svelte";
  import { cn } from "$src/lib/shared/utils";
  import type { Author, AuthorView, Post } from "$types";
  import { Badge } from "$ui/badge";
  import ImageIcon from "@lucide/svelte/icons/image";
  import Star from "@lucide/svelte/icons/star";
  import { Avatar, Button } from "bits-ui";

  /** `as` sets the title's heading level so the card fits its surrounding document outline. */
  const { post, as = "h3", glass = false }: { post: Post; as?: "h2" | "h3"; glass?: boolean } = $props();

  const dateFormatter = $derived(
    new Intl.DateTimeFormat(clientLocale.current, { year: "numeric", month: "long", day: "numeric" })
  );
  const formatDate = (iso: string | null | undefined): string => {
    if (!iso) return "";
    try {
      return dateFormatter.format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const authorOf = (author: Author | string): AuthorView =>
    typeof author === "string" ? { id: author, name: "Unknown" } : author;

  const author = $derived(authorOf(post.author));
  const displayName = $derived(author.displayName?.trim() || author.name);
  const initials = $derived(displayName.slice(0, 2).toUpperCase());
  const thumb = $derived(
    post.heroImage?.sizes?.card ??
      post.heroImage?.sizes?.thumbnail ??
      (post.heroImage ? { url: post.heroImage.url, width: post.heroImage.width, height: post.heroImage.height } : null)
  );
  const visibleTags = $derived(post.tags?.slice(0, 3) ?? []);
  const overflowTags = $derived((post.tags?.length ?? 0) - visibleTags.length);
</script>

<Button.Root
  href="/newsroom/{post.slug}"
  data-sveltekit-preload-data="hover"
  class={cn(
    "group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl border text-left transition-[scale] delay-75 duration-300 ease-out hover:scale-95 focus-visible:scale-95 data-[featured=true]:border-accent-2/50",
    { glass }
  )}
  data-featured={post.featured}>
  <div class="relative aspect-video w-full overflow-hidden bg-popover">
    {#if thumb && post.heroImage}
      <Avatar.Root class="size-full">
        <Avatar.Image
          src={thumb.url}
          alt={post.heroImage.alt ?? ""}
          width={thumb.width}
          height={thumb.height}
          loading="lazy"
          class="size-full object-cover" />
        <Avatar.Fallback class="flex size-full items-center justify-center bg-foreground/10">
          <ImageIcon class="size-6" aria-label="Image failed to load" />
        </Avatar.Fallback>
      </Avatar.Root>
    {/if}
    <div
      class="pointer-events-none absolute inset-0 bg-linear-to-t from-background/70 via-background/10 to-transparent transition-opacity delay-75 duration-300 ease-out group-hover:opacity-0 group-data-[featured=true]:from-accent-2/70 group-data-[featured=true]:via-accent-2/10">
    </div>
    {#if post.featured}
      <Star
        class="absolute top-2 left-2 size-6 shrink-0 rounded-full fill-accent-2 text-accent-2"
        aria-label="Featured" />
    {/if}
  </div>
  <div class="flex flex-1 flex-col gap-2.5 p-4">
    <div class="flex items-center justify-between gap-4 text-sm">
      <div class="flex min-w-0 items-center justify-center gap-2">
        {#if author.mcUuid}
          <Avatar.Root class="size-4 shrink-0">
            <Avatar.Image
              loading="lazy"
              src="https://nmsr.nickac.dev/face/{author.mcUuid}"
              alt={displayName}
              class="size-full [image-rendering:pixelated]" />
            <Avatar.Fallback
              class="flex size-full items-center justify-center bg-foreground/10 text-[0.5rem] font-semibold text-muted-foreground uppercase"
              >{initials}</Avatar.Fallback>
          </Avatar.Root>
        {/if}
        <span class="truncate text-muted-foreground">{displayName}</span>
      </div>
      <time datetime={post.publishedAt} class="shrink-0 text-muted-foreground">{formatDate(post.publishedAt)}</time>
    </div>

    <svelte:element this={as} class="text-background-foreground text-xl leading-tight font-bold transition-colors"
      >{post.title}</svelte:element>

    {#if post.excerpt}
      <p class="line-clamp-3 text-sm leading-relaxed text-foreground/80">{post.excerpt}</p>
    {/if}

    <div class="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
      <TypeBadge type={post.type} />
      {#each visibleTags as tag (tag)}
        <Badge variant="outline">#{tag}</Badge>
      {/each}
      {#if overflowTags > 0}
        <Badge variant="outline">+{overflowTags}</Badge>
      {/if}
    </div>
  </div>
</Button.Root>
