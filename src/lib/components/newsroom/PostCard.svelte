<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Post } from "$types";
  import { Badge } from "$ui/badge";
  import ImageIcon from "@lucide/svelte/icons/image";
  import Star from "@lucide/svelte/icons/star";
  import { Avatar } from "bits-ui";
  import UserChip from "#lib/components/misc/UserChip.svelte";
  import TypeBadge from "#lib/components/newsroom/TypeBadge.svelte";
  import { clientLocale } from "#lib/hooks/client-locale.svelte.js";
  import { cn } from "#lib/shared/utils";

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

  const thumb = $derived(post.heroImage);
  const visibleTags = $derived(post.tags.slice(0, 3));
  const overflowTags = $derived(post.tags.length - visibleTags.length);
</script>

<!-- The title link stretches over the card, so the author chip can stay interactive without nesting links. -->
<article
  class={cn(
    "group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl border text-left transition-[scale] delay-75 duration-300 ease-out hover:scale-95 has-[a:focus-visible]:scale-95 data-[featured=true]:border-accent-2/50",
    { glass }
  )}
  data-featured={post.featured}>
  <div class="relative aspect-video w-full overflow-hidden bg-popover">
    {#if thumb}
      <Avatar.Root class="size-full">
        <Avatar.Image
          src={thumb.url}
          alt={thumb.alt}
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
      <UserChip profile={post.author} class="text-muted-foreground" />
      <time datetime={post.publishedAt ?? undefined} class="shrink-0 text-muted-foreground"
        >{formatDate(post.publishedAt)}</time>
    </div>

    <svelte:element this={as} class="text-xl leading-tight font-bold text-foreground transition-colors">
      <a
        href={resolve("/newsroom/[slug]", { slug: post.slug })}
        data-sveltekit-preload-data="hover"
        class="outline-none after:absolute after:inset-0 after:content-['']">{post.title}</a>
    </svelte:element>

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
</article>
