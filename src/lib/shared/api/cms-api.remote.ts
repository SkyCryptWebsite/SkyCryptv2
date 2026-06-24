import { query } from "$app/server";
import { env as envPrivate } from "$env/dynamic/private";
import { listPosts as listPostsRequest, type ListPostsParams } from "$lib/shared/api/cms-generated";
import { POST_TYPES, type Post, type PostListResponse } from "$types";
import { error } from "@sveltejs/kit";
import z from "zod";

/**
 * Payload REST filters with bracket-notation query params (`where[x][equals]=y`) and
 * supports comma-separated multi-sort — neither of which orval's URL serializer can
 * express through the typed `where`/`sort` params. We pass them as flat string keys
 * instead; this bridges that plain record to the generated `ListPostsParams` shape.
 */
const asListParams = (params: Record<string, string | number | boolean>): ListPostsParams => params as unknown as ListPostsParams;

/** List published posts, paginated. Featured posts sort first. */
export const listPosts = query(
  z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(20),
    type: z.enum(POST_TYPES).optional()
  }),
  async ({ page, limit, type }) => {
    const params: Record<string, string | number | boolean> = {
      page,
      limit,
      depth: 1,
      sort: "-featured,-publishedAt",
      "where[_status][equals]": "published"
    };
    if (type) params["where[type][equals]"] = type;

    const { data } = await listPostsRequest(asListParams(params));
    return data as PostListResponse;
  }
);

/** List the latest published posts for local unread notifications. */
export const listLatestPostsForNotifications = query(
  z.object({
    limit: z.number().int().min(1).max(10).default(5)
  }),
  async ({ limit }) => {
    try {
      const { data } = await listPostsRequest(asListParams({ page: 1, limit, depth: 1, sort: "-publishedAt", "where[_status][equals]": "published" }));
      return data as PostListResponse;
    } catch (error) {
      console.warn("Failed to load latest newsroom posts for notifications", error);
      return null;
    }
  }
);

/** Get a single published post by slug. */
export const getPostBySlug = query(z.object({ slug: z.string() }), async ({ slug }) => {
  const { data } = await listPostsRequest(asListParams({ limit: 1, depth: 2, "where[slug][equals]": slug, "where[_status][equals]": "published" }));
  if (!data.docs.length) error(404, "Post not found");
  return data.docs[0] as Post;
});

/** Get a draft post by slug. Never cached. Uses CMS_API_TOKEN. */
export const getPostBySlugDraft = query(z.object({ slug: z.string() }), async ({ slug }) => {
  const token = envPrivate.CMS_API_TOKEN;
  const { data } = await listPostsRequest(asListParams({ limit: 1, depth: 2, draft: true, "where[slug][equals]": slug }), token ? { headers: { Authorization: `users API-Key ${token}` } } : undefined);
  if (!data.docs.length) error(404, "Post not found");
  return data.docs[0] as Post;
});
