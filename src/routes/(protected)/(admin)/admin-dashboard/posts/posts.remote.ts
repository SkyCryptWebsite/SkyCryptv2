import { command, query, requested } from "$app/server";
import { error } from "@sveltejs/kit";
import type { JSONContent } from "@tiptap/core";
import { and, count, desc, eq, gt, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { audit, requireStaff } from "#lib/server/admin";
import { db } from "#lib/server/db";
import { post, postRevision } from "#lib/server/db/schema";
import { publish } from "#lib/server/live";
import { getPublicProfiles } from "#lib/server/public-profile";
import { assertValidContent } from "#lib/server/rich-text";
import { presignUpload } from "#lib/server/storage";
import { listArgs } from "#lib/shared/admin";
import { POST_FILTERS, postData, UPLOAD_LIMITS, UPLOAD_TYPES, type PostData } from "#lib/shared/newsroom";

const requireEditor = () => requireStaff({ content: ["manage"] });

const workingTitle = sql<string>`coalesce(${post.draft}->>'title', ${post.title})`;

export const listPosts = query(
  listArgs.extend({ status: z.enum(POST_FILTERS).default("all") }),
  async ({ page, size, q, status }) => {
    await requireEditor();
    const now = new Date();
    const filters: (SQL | undefined)[] = [
      status === "draft" ? eq(post.status, "draft") : undefined,
      status === "scheduled" ? and(eq(post.status, "published"), gt(post.publishedAt, now)) : undefined,
      status === "published" ? and(eq(post.status, "published"), lte(post.publishedAt, now)) : undefined,
      q ? or(ilike(workingTitle, `%${q}%`), ilike(post.slug, `%${q}%`)) : undefined
    ];
    const where = and(...filters);
    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: post.id,
          title: workingTitle,
          slug: post.slug,
          type: post.type,
          status: post.status,
          featured: post.featured,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          hasChanges: sql<boolean>`${post.draft} is not null`,
          authorId: post.authorId
        })
        .from(post)
        .where(where)
        .orderBy(desc(post.updatedAt))
        .limit(size)
        .offset((page - 1) * size),
      db.select({ total: count() }).from(post).where(where)
    ]);
    const profiles = await getPublicProfiles(rows.map((row) => row.authorId));
    return {
      total,
      rows: rows.map((row) => ({ ...row, author: (row.authorId && profiles.get(row.authorId)) || null }))
    };
  }
);

const emptyDoc: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export const createPost = command(async () => {
  const { staff } = await requireEditor();
  const id = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(post).values({
      id,
      slug: `untitled-${id.slice(0, 8)}`,
      title: "",
      type: "news",
      content: emptyDoc,
      authorId: staff.id
    });
    await audit(tx, { actorId: staff.id, action: "post.create", targetId: id });
  });
  return id;
});

const toData = (row: typeof post.$inferSelect): PostData => ({
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  type: row.type,
  tags: row.tags,
  featured: row.featured,
  heroImage: row.heroImage ?? null,
  content: row.content,
  seoTitle: row.seoTitle,
  seoDescription: row.seoDescription
});

export const getPost = query(z.string(), async (id) => {
  await requireEditor();
  const [row] = await db.select().from(post).where(eq(post.id, id));
  if (!row) error(404, "Post not found.");
  const profiles = await getPublicProfiles([row.authorId]);
  return {
    id: row.id,
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    hasChanges: row.draft !== null,
    data: row.draft ?? toData(row),
    author: (row.authorId && profiles.get(row.authorId)) || null
  };
});

async function checkData(id: string, data: PostData) {
  assertValidContent(data.content);
  const [taken] = await db
    .select({ id: post.id })
    .from(post)
    .where(and(eq(post.slug, data.slug), sql`${post.id} <> ${id}`));
  if (taken) error(409, "Another post already uses this slug.");
}

/** Autosave. Published posts keep their live version until the changes are published. */
export const savePost = command(z.object({ id: z.string(), data: postData }), async ({ id, data }) => {
  await requireEditor();
  await checkData(id, data);
  const [row] = await db.select({ status: post.status }).from(post).where(eq(post.id, id));
  if (!row) error(404, "Post not found.");
  if (row.status === "published") await db.update(post).set({ draft: data }).where(eq(post.id, id));
  else
    await db
      .update(post)
      .set({ ...data, draft: null })
      .where(eq(post.id, id));
  // The editor reads `hasChanges` from it.
  await getPost(id).refresh();
  return { savedAt: new Date() };
});

/** Publishes the given data. Without a date, a post keeps its original publish date; a future date schedules it. */
export const publishPost = command(
  z.object({ id: z.string(), data: postData, publishedAt: z.date().nullable() }),
  async ({ id, data, publishedAt }) => {
    const { staff } = await requireEditor();
    if (!data.title) error(400, "Give the post a title before publishing.");
    await checkData(id, data);
    await db.transaction(async (tx) => {
      const [row] = await tx.select({ publishedAt: post.publishedAt }).from(post).where(eq(post.id, id));
      if (!row) error(404, "Post not found.");
      const date = publishedAt ?? row.publishedAt ?? new Date();
      await tx
        .update(post)
        .set({ ...data, draft: null, status: "published", publishedAt: date })
        .where(eq(post.id, id));
      await tx.insert(postRevision).values({ id: crypto.randomUUID(), postId: id, data, publishedBy: staff.id });
      await audit(tx, {
        actorId: staff.id,
        action: "post.publish",
        targetId: id,
        details: { title: data.title, publishedAt: date.toISOString() }
      });
    });
    publish("posts");
    await requested(listPosts, 1).refreshAll();
  }
);

/** Takes a post offline; any unpublished changes become the working copy. */
export const unpublishPost = command(z.string(), async (id) => {
  const { staff } = await requireEditor();
  await db.transaction(async (tx) => {
    const [row] = await tx.select().from(post).where(eq(post.id, id));
    if (!row) error(404, "Post not found.");
    await tx
      .update(post)
      .set({ ...(row.draft ?? {}), draft: null, status: "draft" })
      .where(eq(post.id, id));
    await audit(tx, { actorId: staff.id, action: "post.unpublish", targetId: id, details: { title: row.title } });
  });
  publish("posts");
  await requested(listPosts, 1).refreshAll();
});

/** Drops unpublished changes to a published post. */
export const discardChanges = command(z.string(), async (id) => {
  await requireEditor();
  await db.update(post).set({ draft: null }).where(eq(post.id, id));
});

export const deletePost = command(z.string(), async (id) => {
  const { staff } = await requireEditor();
  await db.transaction(async (tx) => {
    const [row] = await tx.delete(post).where(eq(post.id, id)).returning({ title: post.title });
    if (!row) error(404, "Post not found.");
    await audit(tx, { actorId: staff.id, action: "post.delete", targetId: id, details: { title: row.title } });
  });
  publish("posts");
  await requested(listPosts, 1).refreshAll();
});

export const listRevisions = query(z.string(), async (postId) => {
  await requireEditor();
  const rows = await db
    .select()
    .from(postRevision)
    .where(eq(postRevision.postId, postId))
    .orderBy(desc(postRevision.createdAt))
    .limit(50);
  const profiles = await getPublicProfiles(rows.map((row) => row.publishedBy));
  return rows.map((row) => ({
    id: row.id,
    data: row.data,
    createdAt: row.createdAt,
    publishedBy: (row.publishedBy && profiles.get(row.publishedBy)) || null
  }));
});

/** A signed URL to upload a file straight to R2; returns where it will be served from. */
export const createUpload = command(
  z.object({ type: z.string(), size: z.number().int().positive() }),
  async ({ type, size }) => {
    await requireEditor();
    const upload = Object.hasOwn(UPLOAD_TYPES, type) ? UPLOAD_TYPES[type] : undefined;
    if (!upload) error(400, "This file type isn’t supported.");
    if (size > UPLOAD_LIMITS[upload.kind]) {
      error(400, `${upload.kind} files can be at most ${UPLOAD_LIMITS[upload.kind] / 1024 / 1024} MB.`);
    }
    const key = `newsroom/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${upload.ext}`;
    return presignUpload(key, type, size);
  }
);
