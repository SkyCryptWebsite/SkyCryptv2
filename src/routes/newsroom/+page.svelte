<script lang="ts">
  import { afterNavigate, goto } from "$app/navigation";
  import { getNewsroomNotifications } from "$ctx";
  import Pagination from "$lib/components/newsroom/Pagination.svelte";
  import PostCard from "$lib/components/newsroom/PostCard.svelte";
  import { POST_TYPE_LABELS } from "$lib/components/newsroom/TypeBadge.svelte";
  import EmptyStat from "$src/lib/components/EmptyStat.svelte";
  import { POST_TYPES, type PostType } from "$types";
  import * as Select from "$ui/select";
  import SearchXIcon from "@lucide/svelte/icons/search-x";
  import SvelteSeo from "svelte-seo";
  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();
  const notifications = getNewsroomNotifications();

  const filterHref = (t?: PostType) => (t ? `/newsroom?type=${t}` : "/newsroom");
  const baseHref = $derived(filterHref(data.type));

  function onFilterChange(value: string) {
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    void goto(filterHref(value === "" ? undefined : (value as PostType)));
  }
  let selectValue = $derived<string>(data.type ?? "");
  const getFilterLabel = (value: string) => (value === "" ? "All categories" : POST_TYPE_LABELS[value as PostType]);

  const markVisiblePostsSeen = () => notifications.markAllSeen(data.docs);

  afterNavigate(markVisiblePostsSeen);
</script>

<SvelteSeo
  title="Newsroom | SkyCrypt"
  description="Latest announcements and updates from the SkyCrypt team"
  canonical="https://sky.shiiyu.moe/newsroom"
  openGraph={{
    type: "website",
    title: "Newsroom | SkyCrypt",
    description: "Latest announcements and updates from the SkyCrypt team",
    site_name: "SkyCrypt",
    images: [{ url: "https://sky.shiiyu.moe/img/newsroom.avif", width: 1200, height: 630, alt: "SkyCrypt Newsroom" }]
  }}
  twitter={{
    card: "summary_large_image",
    title: "Newsroom | SkyCrypt",
    description: "Latest announcements and updates from the SkyCrypt team",
    image: "https://sky.shiiyu.moe/img/newsroom.avif",
    imageAlt: "SkyCrypt Newsroom"
  }} />

<main
  class="@container mx-auto flex max-w-272 flex-col gap-6 pt-5 pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))]">
  <div
    class="flex flex-col gap-4 rounded-xl border glass p-4 glass-brightness-150 glass-contrast-60 @md:flex-row @md:items-center @md:justify-between dark:glass-brightness-50 dark:glass-contrast-100">
    <header class="flex flex-col gap-1">
      <h1 class="text-3xl leading-tight font-bold text-foreground">Newsroom</h1>
      <p class="text-sm text-foreground/70">Latest announcements and updates from the SkyCrypt team.</p>
    </header>
    <div class="flex flex-col items-stretch gap-3 @sm:flex-row @sm:items-center">
      <Select.Root bind:value={selectValue} type="single" onValueChange={onFilterChange}>
        <Select.Trigger>
          {getFilterLabel(selectValue)}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="">All categories</Select.Item>
          {#each POST_TYPES as t (t)}
            <Select.Item value={t}>{POST_TYPE_LABELS[t]}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      <Pagination page={data.page} totalPages={data.totalPages} {baseHref} />
    </div>
  </div>

  {#if data.docs.length === 0}
    <EmptyStat
      class="glass"
      icon={SearchXIcon}
      title="No posts found"
      description={data.type
        ? `No ${POST_TYPE_LABELS[data.type].toLowerCase()} posts in this category.`
        : "Check back soon for announcements and updates."} />
  {:else}
    <div class="grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-3">
      {#each data.docs as post (post.id)}
        <PostCard {post} as="h2" glass={true} />
      {/each}
    </div>

    {#if data.totalPages > 1}
      <div
        class="flex items-center justify-end rounded-xl border glass p-4 glass-brightness-150 glass-contrast-60 dark:glass-brightness-50 dark:glass-contrast-100">
        <Pagination page={data.page} totalPages={data.totalPages} {baseHref} />
      </div>
    {/if}
  {/if}
</main>
