import { fetchMuseum } from "$lib/server/lib";
import { decodeMusemItems } from "$lib/server/stats/items/museum";
import { getMuseumItems } from "$lib/server/stats/museum";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const { paramProfile } = params;

  const museum = await fetchMuseum(paramProfile);
  const decodedMuseum = await decodeMusemItems(museum["fb3d96498a5b4d5b91b763db14b195ad"], []);
  const processedMuseum = await getMuseumItems(decodedMuseum);

  return json(processedMuseum);
};
