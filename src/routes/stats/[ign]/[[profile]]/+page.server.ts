import type { PageServerLoad } from "./$types";

const baseAPI = "http://localhost:5173/api/stats";

export const load = (async ({ params, fetch }) => {
  const { ign, profile } = params;

  const data = fetch(`${baseAPI}/${ign}/${profile}`)
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
      return null;
    });

  return {
    user: data
  };
}) satisfies PageServerLoad;
