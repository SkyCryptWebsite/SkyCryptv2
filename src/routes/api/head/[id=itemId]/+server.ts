import { getHead } from "$lib/server/helper/renderer";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// GET /api/head/[id=itemId]
export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  try {
    const attachment = await getHead(id);

    return new Response(attachment, { headers: { "Content-Type": "image/png" } });
  } catch (errorMsg) {
    console.log("ERROR:", errorMsg);
    throw error(500, "Internal server error");
  }
};
