import { listPosts } from "$lib/shared/api/cms-api.remote";
import { getContributors } from "$routes/contributors.remote";
import type { RequestHandler } from "@sveltejs/kit";
import * as sitemap from "super-sitemap/sveltekit";

const BASE_URL = "https://sky.shiiyu.moe";
const postSlugs = new Set<string>();
const statsPaths = new Set<string>();

export const GET: RequestHandler = async () => {
  try {
    const contributors = await getContributors();

    for (const contributor of contributors) {
      const ign = contributor.name ?? contributor.id;
      if (!ign) continue;
      statsPaths.add(`/stats/${encodeURIComponent(ign)}`);
    }
  } catch (error) {
    console.error("Failed to generate contributor sitemap entries", error);
  }

  try {
    const { docs: posts } = await listPosts({});
    for (const post of posts) {
      if (post.slug) {
        postSlugs.add(post.slug);
      }
    }
  } catch (error) {
    console.error("Failed to generate newsroom sitemap entries", error);
  }

  return sitemap.response({
    origin: BASE_URL,
    paramValues: {
      "/newsroom/[slug]": [...postSlugs]
    },
    additionalPaths: [...statsPaths],
    excludeRoutePatterns: [/^\/stats(?:$|\/)/, /^\/login(?:$|\/)/, /^\/dashboard(?:$|\/)/],
    headers: {
      "cache-control": "max-age=0, s-maxage=3600"
    }
  });
};
