import type { BannerVariant, MediaImage, PostType } from "$types";
import type { JSONContent } from "@tiptap/core";
import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { PostData } from "#lib/shared/newsroom";
import { user } from "./auth.schema";

/**
 * The columns hold what the public sees once `status` is "published" and `publishedAt` has passed (a future
 * `publishedAt` is a scheduled post). Edits to a published post go to `draft` until they are published.
 */
export const post = pgTable(
  "post",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").default("").notNull(),
    type: text("type").$type<PostType>().notNull(),
    tags: text("tags")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    featured: boolean("featured").default(false).notNull(),
    heroImage: jsonb("hero_image").$type<MediaImage>(),
    content: jsonb("content").$type<JSONContent>().notNull(),
    seoTitle: text("seo_title").default("").notNull(),
    seoDescription: text("seo_description").default("").notNull(),
    status: text("status").$type<"draft" | "published">().default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    draft: jsonb("draft").$type<PostData>(),
    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [index("post_status_publishedAt_idx").on(table.status, table.publishedAt)]
);

/** A snapshot of every publish, for history and restoring. */
export const postRevision = pgTable(
  "post_revision",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    data: jsonb("data").$type<PostData>().notNull(),
    publishedBy: text("published_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [index("post_revision_postId_idx").on(table.postId, table.createdAt)]
);

/** Site-wide notices. Visible while enabled and between the optional start and end times. */
export const banner = pgTable("banner", {
  id: text("id").primaryKey(),
  content: jsonb("content").$type<JSONContent>().notNull(),
  variant: text("variant").$type<BannerVariant>().default("info").notNull(),
  dismissible: boolean("dismissible").default(true).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
});
