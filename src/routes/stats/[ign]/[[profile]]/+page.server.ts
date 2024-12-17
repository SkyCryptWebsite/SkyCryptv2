import type { PageServerLoad } from "./$types";

export const load = (async ({ params, fetch }) => {
  const { ign, profile } = params;

  const data = fetch(`/api/stats/${ign}/${profile}`)
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
      return null;
    });

  return {
    user: data
  };
}) satisfies PageServerLoad;
