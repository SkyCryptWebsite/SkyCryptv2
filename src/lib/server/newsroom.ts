import type { Banner, Post, PostListResponse, PostType, PublicProfile } from "$types";
import { and, count, desc, eq, getTableColumns, gt, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "#lib/server/db";
import { banner, post } from "#lib/server/db/schema";
import { getPublicProfiles } from "#lib/server/public-profile";
import { renderContent } from "#lib/server/rich-text";
import type { PostData } from "#lib/shared/newsroom";

// Compared against JS dates rather than now(): the columns are written the same way, so time zones can't drift.
const isLive = () => and(eq(post.status, "published"), lte(post.publishedAt, new Date()));

// Dropped from list queries.
const { content, draft, ...listColumns } = getTableColumns(post);

type ListRow = Omit<typeof post.$inferSelect, "content" | "draft">;

function toPost(row: ListRow, profiles: Map<string, PublicProfile>, data?: PostData): Post {
  const fields = data ?? row;
  return {
    id: row.id,
    slug: fields.slug,
    title: fields.title,
    excerpt: fields.excerpt,
    type: fields.type,
    tags: fields.tags,
    featured: fields.featured,
    heroImage: fields.heroImage ?? null,
    seoTitle: fields.seoTitle,
    seoDescription: fields.seoDescription,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    author: (row.authorId && profiles.get(row.authorId)) || null
  };
}

/** Published posts, featured first. */
export async function listPublishedPosts({ page, limit, type }: { page: number; limit: number; type?: PostType }) {
  const where = and(isLive(), type ? eq(post.type, type) : undefined);
  const [rows, [{ total }]] = await Promise.all([
    db
      .select(listColumns)
      .from(post)
      .where(where)
      .orderBy(desc(post.featured), desc(post.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: count() }).from(post).where(where)
  ]);
  const profiles = await getPublicProfiles(rows.map((row) => row.authorId));
  return {
    docs: rows.map((row) => toPost(row, profiles)),
    page,
    totalPages: Math.ceil(total / limit),
    totalDocs: total
  } satisfies PostListResponse;
}

/** The newest published posts, ignoring the featured pin. */
export async function listLatestPosts(limit: number) {
  const rows = await db.select(listColumns).from(post).where(isLive()).orderBy(desc(post.publishedAt)).limit(limit);
  const profiles = await getPublicProfiles(rows.map((row) => row.authorId));
  return rows.map((row) => toPost(row, profiles));
}

export async function listPublishedSlugs() {
  const rows = await db.select({ slug: post.slug }).from(post).where(isLive());
  return rows.map((row) => row.slug);
}

export async function getPublishedPost(slug: string) {
  const [row] = await db
    .select()
    .from(post)
    .where(and(eq(post.slug, slug), isLive()))
    .limit(1);
  if (!row) return null;
  const profiles = await getPublicProfiles([row.authorId]);
  return { ...toPost(row, profiles), html: renderContent(row.content) };
}

/** The working copy, including unpublished changes, for staff previews. Matches the draft slug too. */
export async function getPreviewPost(slug: string) {
  const [row] = await db
    .select()
    .from(post)
    .where(or(eq(post.slug, slug), sql`${post.draft}->>'slug' = ${slug}`))
    .limit(1);
  if (!row) return null;
  const profiles = await getPublicProfiles([row.authorId]);
  const data = row.draft ?? undefined;
  return { ...toPost(row, profiles, data), html: renderContent(data?.content ?? row.content) };
}

/** Enabled banners that haven't ended, including ones starting within a day so open pages can show them on time. */
export async function listActiveBanners(): Promise<Banner[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(banner)
    .where(
      and(
        eq(banner.enabled, true),
        or(isNull(banner.endsAt), gt(banner.endsAt, now)),
        or(isNull(banner.startsAt), lte(banner.startsAt, new Date(now.getTime() + 86_400_000)))
      )
    )
    .orderBy(desc(banner.createdAt));
  return rows.map((row) => ({
    id: row.id,
    html: renderContent(row.content),
    variant: row.variant,
    dismissible: row.dismissible,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null
  }));
}
