import { error, isHttpError } from "@sveltejs/kit";
import { log } from "evlog";
import { auth } from "#lib/server/auth";
import { getPreviewPost, getPublishedPost } from "#lib/server/newsroom";
import { can } from "#lib/shared/roles";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url, request, setHeaders }) => {
  // Staff open `?preview=1` from the editor to see unpublished changes; everyone else gets the live post.
  if (url.searchParams.get("preview") === "1") {
    setHeaders({ "cache-control": "no-store" });
    const session = await auth.api.getSession({ headers: request.headers, query: { disableCookieCache: true } });
    if (!session || !can(session.user.role, { content: ["manage"] })) error(404, "Not found");
    const post = await getPreviewPost(params.slug);
    if (!post) error(404, "Not found");
    return { post, preview: true };
  }

  setHeaders({ "cache-control": "public, s-maxage=60, stale-while-revalidate=600" });
  try {
    const post = await getPublishedPost(params.slug);
    if (!post) error(404, "Not found");
    return { post, preview: false };
  } catch (e) {
    if (isHttpError(e)) throw e;
    log.error({ action: "newsroom.fetch_post", slug: params.slug, error: e });
    error(503, "Newsroom is temporarily unavailable");
  }
};
