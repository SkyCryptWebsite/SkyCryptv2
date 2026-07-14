<script lang="ts">
  import { getNewsroomNotifications } from "$ctx";
  import { clientLocale } from "$lib/hooks/client-locale.svelte";
  import TypeBadge from "$src/lib/components/newsroom/TypeBadge.svelte";
  import type { Post } from "$types";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import ImageIcon from "@lucide/svelte/icons/image";
  import Newspaper from "@lucide/svelte/icons/newspaper";
  import { Avatar } from "bits-ui";

  interface Props {
    posts: Post[];
    newestUnseen: Post;
    closeToast?: () => void;
  }

  const { posts, newestUnseen, closeToast = () => {} }: Props = $props();
  const notifications = getNewsroomNotifications();

  const dateFormatter = $derived(
    new Intl.DateTimeFormat(clientLocale.current, { year: "numeric", month: "long", day: "numeric" })
  );
  const thumb = $derived(
    newestUnseen.heroImage?.sizes?.card ??
      newestUnseen.heroImage?.sizes?.thumbnail ??
      (newestUnseen.heroImage
        ? {
            url: newestUnseen.heroImage.url,
            width: newestUnseen.heroImage.width,
            height: newestUnseen.heroImage.height
          }
        : null)
  );
  const publishedDate = $derived(formatDate(newestUnseen.publishedAt));
  const visibleTags = $derived(newestUnseen.tags?.slice(0, 3) ?? []);
  const overflowTags = $derived((newestUnseen.tags?.length ?? 0) - visibleTags.length);

  function formatDate(iso: string | null | undefined): string {
    if (!iso) return "";
    try {
      return dateFormatter.format(new Date(iso));
    } catch {
      return iso;
    }
  }

  function dismiss() {
    notifications.markAllSeen(posts);
    closeToast();
  }
</script>

<section
  role="status"
  aria-live="polite"
  class="@container-normal flex w-full max-w-sm flex-col gap-3 px-4 py-3 text-foreground shadow-lg shadow-black/10 @sm:max-w-md">
  <div class="flex min-w-0 flex-col items-start gap-3">
    {#if thumb && newestUnseen.heroImage}
      <Avatar.Root class="relative mx-auto aspect-video w-full max-w-sm shrink-0 overflow-hidden rounded-xl border">
        <Avatar.Image
          src={thumb.url}
          alt={newestUnseen.heroImage.alt ?? ""}
          width={thumb.width}
          height={thumb.height}
          loading="lazy"
          class="size-full object-cover" />
        <Avatar.Fallback class="bg-foretext-foreground/10 flex size-full items-center justify-center">
          <ImageIcon class="size-5" aria-label="Image failed to load" />
        </Avatar.Fallback>
        <div
          class="pointer-events-none absolute inset-0 bg-linear-to-t from-background/70 via-background/10 to-transparent transition-opacity duration-300 ease-out group-hover:opacity-0">
        </div>
      </Avatar.Root>
    {:else}
      <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Newspaper class="size-5" />
      </div>
    {/if}
    <div class="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
      <TypeBadge type={newestUnseen.type} />
      {#each visibleTags as tag (tag)}
        <Badge variant="outline">#{tag}</Badge>
      {/each}
      {#if overflowTags > 0}
        <Badge variant="outline">+{overflowTags}</Badge>
      {/if}
    </div>

    <div class="min-w-0 flex-1 space-y-1">
      <p class="text-lg leading-tight font-bold text-foreground lg:text-xl">{newestUnseen.title}</p>
      {#if newestUnseen.excerpt}
        <p class="line-clamp-3 text-sm leading-relaxed text-foreground/80">{newestUnseen.excerpt}</p>
      {/if}
      {#if publishedDate}
        <time
          datetime={newestUnseen.publishedAt ?? undefined}
          class="shrink-0 text-xs font-medium text-muted-foreground">{publishedDate}</time>
      {/if}
    </div>
  </div>

  <div class="flex items-center justify-end gap-2">
    <Button aria-label="Dismiss newsroom notifications" onclick={dismiss} variant="outline">Close</Button>
    {#if newestUnseen.slug}
      <Button href="/newsroom/{newestUnseen.slug}" data-sveltekit-preload-data="hover" onclick={dismiss}>Read</Button>
    {/if}
  </div>
</section>
