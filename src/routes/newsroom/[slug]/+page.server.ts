import { env as envPrivate } from "$env/dynamic/private";
import { getPostBySlug, getPostBySlugDraft } from "$lib/shared/api/cms-api.remote";
import { richTextToHtml } from "$lib/shared/cms/rich-text-html";
import type { Post } from "$types";
import { error, isHttpError } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

function renderRichTextBlocks(post: Post): Post {
  return {
    ...post,
    body:
      post.body?.map((block) =>
        block.blockType === "richText" ? { ...block, html: richTextToHtml(block.content) } : block
      ) ?? post.body
  };
}

export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
  const preview = url.searchParams.get("preview") === "1";
  const token = url.searchParams.get("token") ?? "";

  if (preview) {
    const expected = envPrivate.CMS_PREVIEW_TOKEN;
    if (!expected || !constantTimeEqual(token, expected)) error(404, "Not found");
    setHeaders({ "cache-control": "no-store" });
    try {
      const post = await getPostBySlugDraft({ slug: params.slug });
      return { post: renderRichTextBlocks(post), preview: true };
    } catch (e) {
      if (isHttpError(e)) throw e;
      console.error("Failed to fetch draft from CMS:", e);
      error(503, "Newsroom is temporarily unavailable");
    }
  }

  setHeaders({ "cache-control": "public, s-maxage=60, stale-while-revalidate=600" });
  try {
    const post = await getPostBySlug({ slug: params.slug });
    return { post: renderRichTextBlocks(post), preview: false };
  } catch (e) {
    if (isHttpError(e)) throw e;
    console.error("Failed to fetch post from CMS:", e);
    error(503, "Newsroom is temporarily unavailable");
  }
};
