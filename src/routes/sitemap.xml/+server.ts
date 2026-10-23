import { getContributors } from "$routes/contributors.remote";
import type { RequestHandler } from "@sveltejs/kit";
import { log } from "evlog";
import * as sitemap from "super-sitemap/sveltekit";
import { listPublishedSlugs } from "#lib/server/newsroom";

const BASE_URL = "https://sky.shiiyu.moe";

export const GET: RequestHandler = async () => {
  // Per request, so unpublished posts drop out instead of lingering until a restart.
  const postSlugs = new Set<string>();
  const statsPaths = new Set<string>();

  try {
    const contributors = await getContributors(__PRERENDER_VERSION__);

    for (const contributor of contributors) {
      const ign = contributor.username ?? contributor.id;
      if (!ign) continue;
      statsPaths.add(`/stats/${encodeURIComponent(ign)}`);
    }
  } catch (error) {
    log.error({ action: "sitemap.contributors_failed", error });
  }

  try {
    for (const slug of await listPublishedSlugs()) postSlugs.add(slug);
  } catch (error) {
    log.error({ action: "sitemap.newsroom_failed", error });
  }

  return sitemap.response({
    origin: BASE_URL,
    paramValues: {
      "/newsroom/[slug]": [...postSlugs]
    },
    additionalPaths: [...statsPaths],
    excludeRoutePatterns: [
      /^\/stats(?:$|\/)/,
      /^\/login(?:$|\/)/,
      /^\/dashboard(?:$|\/)/,
      /^\/admin-dashboard(?:$|\/)/
    ],
    headers: {
      "cache-control": "max-age=0, s-maxage=3600"
    }
  });
};
