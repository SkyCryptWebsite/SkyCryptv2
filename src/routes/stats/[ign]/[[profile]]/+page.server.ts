import type { Stats as StatsType } from "$lib/types/stats";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, fetch }) => {
  const { ign, profile } = params;

  const data = fetch(`/api/stats/${ign}/${profile}`)
    .then((res) => res.json() as Promise<StatsType>)
    .catch((err) => {
      console.error(err);
      return null;
    });

  return {
    user: data
  };
}) satisfies PageServerLoad;
