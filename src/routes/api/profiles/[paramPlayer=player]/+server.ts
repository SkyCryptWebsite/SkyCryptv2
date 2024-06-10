import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getProfiles } from "$lib/server/lib";

// GET /api/profiles/[id=player]
export const GET: RequestHandler = async ({ params }) => {
  const timeNow = Date.now();
  const { paramPlayer } = params;
  if (!paramPlayer) {
    throw error(404, "Profiles not found");
  }

  const profiles = await getProfiles(paramPlayer).catch((e) => {
    throw error(404, e.message);
  });

  console.log(`/api/profiles/${paramPlayer} took ${Date.now() - timeNow}ms`);
  return json(profiles);
};
