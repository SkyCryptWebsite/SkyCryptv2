import { listPosts } from "$lib/shared/api/cms-api.remote";
import { POST_TYPES, type PostType } from "$types";
import { error, isHttpError } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const POSTS_PER_PAGE = 12;

const isPostType = (value: string | null): value is PostType =>
  value != null && (POST_TYPES as readonly string[]).includes(value);

export const load: PageServerLoad = async ({ url, setHeaders }) => {
  setHeaders({ "cache-control": "public, s-maxage=60, stale-while-revalidate=600" });

  const rawPage = url.searchParams.get("page");
  const parsed = rawPage == null ? 1 : Number.parseInt(rawPage, 10);
  const page = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;

  const rawType = url.searchParams.get("type");
  const type = isPostType(rawType) ? rawType : undefined;

  try {
    const result = await listPosts({ page, limit: POSTS_PER_PAGE, type });
    if (result && result.totalPages > 0 && page > result.totalPages) error(404, "Page not found");
    return { ...result, type };
  } catch (e) {
    if (isHttpError(e)) throw e;
    console.error("Failed to list posts from CMS:", e);
    error(503, "Newsroom is temporarily unavailable");
  }
};
