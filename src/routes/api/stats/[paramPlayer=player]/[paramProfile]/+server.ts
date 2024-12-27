import { fetchMuseum, fetchPlayer, getProfile } from "$lib/server/lib";
import { getStats } from "$lib/server/stats";
import { json } from "@sveltejs/kit";
import zlib from "zlib";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, request, cookies }) => {
  const timeNow = Date.now();
  const { paramPlayer, paramProfile } = params;

  const [profile, player] = await Promise.all([getProfile(paramPlayer, paramProfile, { cache: true }), fetchPlayer(paramPlayer, { cache: true })]);
  const museum = await fetchMuseum(profile.profile_id);

  const packs = JSON.parse(cookies.get("disabledPacks") || "[]");
  const stats = await getStats(profile, player, { museum, packs: packs });

  const acceptEncoding = request.headers.get("accept-encoding");
  const supportsGzip = acceptEncoding?.includes("gzip");
  if (supportsGzip) {
    const compressed = zlib.gzipSync(JSON.stringify(stats));
    console.log(`/api/stats/${paramPlayer} took ${Date.now() - timeNow}ms`);

    return new Response(compressed, {
      headers: {
        "content-encoding": "gzip",
        "content-type": "application/json"
      }
    });
  }

  console.log(`/api/stats/${paramPlayer}/${paramProfile} took ${Date.now() - timeNow}ms`);
  return json(stats);
};
