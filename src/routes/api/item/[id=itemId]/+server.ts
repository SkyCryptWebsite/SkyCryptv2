import { renderItem } from "$lib/renderer";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// GET /api/head/[id=itemId]
export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  try {
    const damage = parseInt(id.split(":")?.at(-1) ?? "");
    const attachment = await renderItem(id, { damage: isNaN(damage) ? 0 : damage });

    return new Response(attachment.image, { headers: { "Content-Type": "image/png" } });
  } catch (errorMsg) {
    console.log("ERROR:", errorMsg);
    throw error(500, "Internal server error");
  }
};
